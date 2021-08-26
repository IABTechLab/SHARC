# SHARC Technical Specification [DRAFT]

*Notes for drafting: We will be drafting this doc in conjunction with developing a proof of concept. Some technical details cannot be defined until we know what will work; however, we can identify some of the functions and describe them here. Later we can add the technical details.*

We may be working with both JSON and HTML, and while we may not know how a given feature functions, we can begin to parse things out as we learn the best technical way to handle them.

Some initial thoughts:

* JSON: What does the "container" need to know before executing?
* HTML: The creative owns this
* 3 components: JSON (pre-execution details), API (communication), and HTML (intractable functions and raw creative)

#TOC 
Todo

#Front Matter
* Short statement about purpose
* Intended audience
* Contributing companies
* Table of updates
* About IAB

# Overview
* Reference: [kick-off notes](https://docs.google.com/document/d/1gibHwjfReVlsdqe1KNZxr5A75kPM47oev2sy6G5XROw/edit?usp=sharing)
* Problem
* Solution
* Scope (in/out)
* short-term/long-term goals

#Guiding principles
* Performance
* Industry standards interoperability 
* Consumer protection
* Publisher safety and security
* Low barrier of entry (simplicity and ubiquity)
* Minimize impact on key stakeholders in the supply chain (example: OMID included JS libraries to reduce customization that impacted efficiency)
* No ambiguity (detailed specifics in both spec and implementation guide) - while also not delaying release for the sake of clarifying, sub-groups to focus on blocking issues and defying a process to get things done
* Extensibility (helps enable testing of new features before implementing)
* Graceful degradation

# How it works
A general overview of the process for serving, receiving, executing and communicating.

Adoption: How to handle compatibility issues with current standards (MRAID, SF, etc.), transition to SHARC, etc. Communicating with partners, etc.

# Details
*Note: details should clearly state who does what, when actions occur, and what the expected responses are.*

### Ad Lifecycle
* Pre-execution
* Ad Lifecycle - Define the end-to-end lifecycle and break down state
	* Container Creation
	* Creative Loading
	* Preparing to Render
* Rendering
* Destroying

### Rendering
* Viewports
	* Sizing (an event, but a complicated one that deserves its own section)
		* How do container/ad coordinate size/resize
		* Response when size can't be done

### Clicks (Navigation events, which can be click, swipe, gesture, etc.)
### Tracking
### Events

#Appendix

## Glossary
TBD
## Collateral
TBD