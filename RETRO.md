# Retrospective
The final phase of this project focused on balancing immediate stability with the identified security and logic requirements. The primary goal was to address critical vulnerabilities, such as **cross-site scripting (XSS) entry points** and **architectural flaws** within the management system, ensuring the application remained functional while becoming significantly more secure.

### Trade-offs
The most significant trade-off was balancing **stability improvements** over UI enhancements. Priority was placed on addressing bugs and security vulnerabilities rather than redesigning the interface, as maintaining system reliability and stability was considered more important than visual improvements. Additionally, the existing **pagination logic** for the next button was left unchanged to avoid introducing new errors that could negatively impact database navigation.

### Future Improvements
With more time, the focus would shift towards addressing the issue identified in the **architecture proposal** and **retroactive futureproofing**. Since anyone who has access to the system can exploit the bugs, dealing with the root cause (anyone having access to the system) would take priority. Beyond immediate security concerns, a total restructuring of the codebase into a modular design could be used to improve maintainability in the long-term.

### Deliberate Omissions
Aside from following the core project constraints, the **CSS** was left untouched. While the UI would benefit from modernization, the priority remained strictly on the logic and security layers. Similarly, the underlying system architecture was left in its original state rather than being reorganized for efficiency, ensuring the updates focused entirely on patching high-risk vulnerabilities.