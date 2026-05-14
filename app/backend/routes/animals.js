const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  const offset = page * limit; // added offset so pages scroll based on offset, not 1 at a time

  // changed query to run once, instead of once per animal
  const animals = db.prepare(`
    SELECT 
      a.*,
      (
        SELECT json_object(
          'event_type', h.event_type,
          'date', h.date,
          'vet_name', h.vet_name,
          'notes', h.notes
        )
        FROM health_events h
        WHERE h.animal_id = a.id
        ORDER BY h.date DESC
        LIMIT 1
      ) AS latest_health_event
    FROM animals a
    LIMIT ? OFFSET ?
  `).all(limit, offset); // added offset so pages scroll based on offset, not 1 at a time

  // SQLite returns JSON as string -> convert it
  const result = animals.map(a => ({
    ...a,
    latest_health_event: a.latest_health_event
      ? JSON.parse(a.latest_health_event)
      : null
  }));

  res.json(result);
});

// use transactions to avoid data inconsistency
router.post('/', (req, res) => {
  const { name, tag_number, breed, date_of_birth, paddock_id } = req.body;

  if (!name || !tag_number) {
    return res.status(400).json({ error: 'name and tag_number are required' });
  }
  
  // validate paddock exists and capacity
  if (paddock_id) {
    const paddock = db.prepare(
      'SELECT id, animal_count, capacity FROM paddocks WHERE id = ?'
    ).get(paddock_id);

    if (!paddock) {
      return res.status(400).json({ error: 'Invalid paddock_id' });
    }

    if (paddock.animal_count >= paddock.capacity) {
      return res.status(400).json({ error: 'Paddock is full' });
    }
  }

  try {
    db.exec('BEGIN');
    
    if (paddock_id) {
      db.prepare(
        'UPDATE paddocks SET animal_count = animal_count + 1 WHERE id = ?'
      ).run(paddock_id);
    }

    const result = db.prepare(`
      INSERT INTO animals (name, tag_number, breed, date_of_birth, paddock_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      name,
      tag_number,
      breed ?? null,
      date_of_birth ?? null,
      paddock_id ?? null
    );

    db.exec('COMMIT');

    const animal = db.prepare(
      'SELECT * FROM animals WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json(animal);

  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to create animal' });
  }
});

router.get('/:id', (req, res) => {
  const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });
  res.json(animal);
});

// atomic updates for paddocks
router.put('/:id', (req, res) => {
  const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });

  const updates = {
    name:          req.body.name          ?? animal.name,
    tag_number:    req.body.tag_number    ?? animal.tag_number,
    breed:         req.body.breed         ?? animal.breed,
    date_of_birth: req.body.date_of_birth ?? animal.date_of_birth,
    paddock_id:    'paddock_id' in req.body ? req.body.paddock_id : animal.paddock_id,
  };

  // validate new paddock exists and validate capacity before moving
  if (updates.paddock_id && updates.paddock_id !== animal.paddock_id) {
    const paddock = db.prepare(
      'SELECT id, animal_count, capacity FROM paddocks WHERE id = ?'
    ).get(updates.paddock_id);

    if (!paddock) {
      return res.status(400).json({ error: 'Invalid paddock_id' });
    }

    if (paddock.animal_count >= paddock.capacity) {
      return res.status(400).json({ error: 'Paddock is full' });
    }
  }

  try {
    db.exec('BEGIN');

    if (updates.paddock_id !== animal.paddock_id) {
      if (animal.paddock_id) {
        db.prepare(
          'UPDATE paddocks SET animal_count = animal_count - 1 WHERE id = ?'
        ).run(animal.paddock_id);
      }

      if (updates.paddock_id) {
        db.prepare(
          'UPDATE paddocks SET animal_count = animal_count + 1 WHERE id = ?'
        ).run(updates.paddock_id);
      }
    }


    db.prepare(`
      UPDATE animals
      SET name = ?, tag_number = ?, breed = ?, date_of_birth = ?, paddock_id = ?
      WHERE id = ?
    `).run(
      updates.name,
      updates.tag_number,
      updates.breed,
      updates.date_of_birth,
      updates.paddock_id,
      req.params.id
    );

    db.exec('COMMIT');

    const updated = db.prepare(
      'SELECT * FROM animals WHERE id = ?'
    ).get(req.params.id);

    res.json(updated);

  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to update animal' });
  }
});

// consistency for paddock updates
router.delete('/:id', (req, res) => {
  const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });

  try {
    db.exec('BEGIN');

    db.prepare('DELETE FROM animals WHERE id = ?').run(req.params.id);

    db.exec('COMMIT');

    res.json({ message: 'deleted' });

  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to delete animal' });
  }
});

router.get('/:id/health-events', (req, res) => {
  const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });

  const events = db.prepare(
    'SELECT * FROM health_events WHERE animal_id = ? ORDER BY date DESC'
  ).all(req.params.id);
  res.json(events);
});

router.post('/:id/health-events', (req, res) => {
  const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });

  const { event_type, notes, date, vet_name } = req.body;
  if (!event_type || !date) {
    return res.status(400).json({ error: 'event_type and date are required' });
  }

  const result = db.prepare(
    'INSERT INTO health_events (animal_id, event_type, notes, date, vet_name) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.id, event_type, notes ?? null, date, vet_name ?? null);

  const event = db.prepare('SELECT * FROM health_events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

module.exports = router;
