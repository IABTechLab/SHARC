<h2>Secure HTML Ad Richmedia Container (SHARC) Product Specification</h2>


<h2>Overview</h2>


Secure HTML Ad Richmedia Container (SHARC) is a secure container API for managed communication between an app webview or webpage and a served ad creative.

<h3>Updates</h3>



<table>
  <tr>
   <td><strong>Version</strong>
   </td>
   <td><strong>Summary</strong>
   </td>
  </tr>
  <tr>
   <td>1st draft
   </td>
   <td>Initial release to public comment
   </td>
  </tr>
  <tr>
   <td>Product Requirements Doc (PRD)
   </td>
   <td>First full product specification released to public for development. Changes from initial draft include a simplified workflow, cleaner use of extensions (supported features), and general edits throughout.
   </td>
  </tr>
</table>


<h2>Contributing Members</h2>


Co-chairs on this project:



* Jeffrey Carlson, Chartboost
* Aron Schatz, DoubleVerify

Other key contributors:



* Kyle Grymonprez, Chartboost
* Marian Rusnak, Verizon
* Bichen Wang, Chartboost
* Laura Evans, Flashtalking by Media Ocean
* Sarah Kirtcheff, Flashtalking by Media Ocean

<h2>Table of Contents</h2>



[TOC]


<h2 id="audience">Audience</h2>


Developers on the sell side for content platforms will need the details in this document for implementing SHARC on their systems. On the buy side, creative developers will need this document to develop display ads that make use of the SHARC APIs.

<h2 id="about-iab-tech-lab">About IAB Tech Lab</h2>


The IAB Technology Laboratory (Tech Lab) is a non-profit consortium that engages a member community globally to develop foundational technology and standards that enable growth and trust in the digital media ecosystem. Composed of digital publishers, ad technology firms, agencies, marketers, and other member companies, IAB Tech Lab focuses on improving the digital advertising supply chain, measurement, and consumer experiences, while promoting responsible use of data. Its work includes the OpenRTB real-time bidding protocol, ads.txt anti- fraud specification, Open Measurement SDK for viewability and verification, VAST video specification, and DigiTrust identity service. Board members include ExtremeReach, Facebook, Google, GroupM, Hearst Digital Media, Index Exchange, Integral Ad Science, LinkedIn, LiveRamp, MediaMath, Microsoft, Oracle Data Cloud, Pandora, PubMatic, Quantcast, Rakuten Marketing, Telaria, The Trade Desk, Verizon Media Group, Xandr, and Yahoo! Japan. Established in 2014, the IAB Tech Lab is headquartered in New York City with staff in San Francisco, Seattle, and London. Learn more at https://www.iabtechlab.com.

<h2 id="introduction">Introduction</h2>


Secure HTML Ad Richmedia Container (SHARC) is a secure container API for managed communication between an app or webpage and a served ad creative.

SHARC is built on the same premise as two of IAB Tech Lab’s ad container standards: SafeFrame and Mobile Rich Ad Interface Definition (MRAID). SafeFrame was designed to run in-web and MRAID was designed to run in a webview in mobile in-app devices. The trouble with these two standards is that they’re both very similar and yet different enough that you would have to build two different ad creatives to run a campaign across both web and mobile. 

Several ad platforms have tried to build a bridge between the two APIs so that an MRAID ad could also run in a SafeFrame container and a SafeFrame ad could run in an MRAID container. Unfortunately, the differences are stark enough that these attempts at cross-compatibility never really worked out.

The Safe Ad Container working group for ad experiences at IAB Tech Lab have started from the ground up to build a standard for managing rich interactive display ads. Our motto for SHARC is:

_Build one ad; serve it everywhere._

With SHARC, a creative developer can build one ad with all the available API functions and serve it to any connected display platform that has implemented SHARC. This is not just limited to web or mobile in-app, it includes a variety of platforms (such as CTV) that are available today and future platforms.

<h3 id="guiding-principles">Guiding principles</h3>




* Performance
* Industry standards interoperability 
* Consumer protection
* Publisher safety and security
* Low barrier of entry (simplicity and ubiquity)
* Minimize impact on key stakeholders in the supply chain (example: OMID included JS libraries to reduce customization that impacted efficiency)
* No ambiguity (detailed specifics in both spec and implementation guide) - while also not delaying release for the sake of clarifying, sub-groups to focus on blocking issues and defying a process to get things done
* Extensibility (helps enable testing of new features before implementing)
* Graceful degradation 

<h3 id="scope">Scope</h3>


SHARC is intended for managing rich media ad interactions in display placements. While video can be included in the final creative, SHARC provides no playback controls or tracking. SHARC ads can also be served into video players that have implemented SHARC and may be a great way to handle non-linear and companion ads in video ad placements, but this spec does not yet cover that use case.

<h4 id="out-of-scope">Out of Scope</h4>


The following ad tech operations are out of scope in SHARC:



* Ad request
* Ad delivery
* Measurement
* Ad tracking and reports

While the above operations are out of scope for SHARC, they play a role in the success of SHARC, and certain SHARC functions either use or support these operations. 

For example IAB Tech Lab’s Advertising Common Object Model (AdCOM) is a standardized data structure for relaying details about the placement, the creative, the context, and any other information that all parties in the supply chain need for placing, tracking, and reporting on the ad exchanges in the campaigns they run. It is a dataspec used in the ad request and response, and SHARC requires data from the same dataspec to communicate some of these unchanging details as part of the initiation cycle. AdCOM is the default and preferred dataspec to use, but SHARC itself doesn’t supply any of this data; it only provides additional data expected to change during runtime, such as the current state of the container, size changes, or volume details. 

The example above explains how other ad operations beyond loading and managing interactions are left to other standards, thereby simplifying SHARC as much as possible. This separation helps SHARC meet some of its guiding principles such as performance and interoperability.  

<h3 id="goals">Goals</h3>


_Write one ad; serve it anywhere._

This is the key goal of SHARC. In order to achieve this goal, we must achieve certain supporting goals to integrate SHARC into systems and operations that make up the digital advertising supply chain. 

Adoption is dependent on the following: 



* Producing a clear and unambiguous spec for SHARC implementers (this document)
* Providing guidance for different operational audiences targeted to their specific needs for making use of SHARC
* Developing reference code, tools, and examples that simplify implementation
* Creating an awareness of the challenges that SHARC solves in the marketplace for display advertising, especially where no solution currently exists
* Educating different audiences on the benefits and use of SHARC
* Regular updates to support growing market needs

If you would like to get involved, please reach out to [support@iabtechlab.com](mailto:support@iabtechlab.com) and we’ll set you up. You can also visit our GitHub repository at [https://github.com/IABTechLab/SHARC](https://github.com/IABTechLab/SHARC). 

<h2 id="how-it-works">How it works</h2>


SHARC is a protocol for managing ad interactions in a secure container that prevents an ad from accessing data on the platform where the ad displays. In the most simplistic overview of how it works, the steps are as follows:



* [pre-SHARC] an ad is matched and delivered to the SHARC placement
* SHARC initiates. In this step, the following occurs:
    * The SHARC-enabled platform creates the secure container (for example: an iframe on web, webview on mobile). 
    * The SHARC container inserts the  creative markup and the creative  prepares its resources.
    * Once in a state to receive SHARC information, the creative informs the container that it is ready to receive initialization information.
    * The SHARC container initializes and provides the creative with data about the container.
    * Data about the environment (placement) and the creative is pulled from the dataspec (default is AdCOM) along with any runtime details such as current size and state and volume settings.
    * Once the creative and the container are ready, SHARC asks the creative to start and waits for the creative to respond.
* Creative responds with “resolve” indicating that it is ready
* Creative executes, using SHARC functions to resize, navigate away from platform, close, etc.
* Upon completion of the ad experience, SHARC signals a close function and unloads the ad.

A diagram and more detailed descriptions of different use cases are provided in the section on [Common Workflows](#common-workflows).

<h3 id="the-relationship-between-simid-and-sharc">The relationship between SIMID and SHARC</h3>


To develop SHARC, we looked to the structure of SIMID as a model. SIMID is IAB Tech Lab’s Secure Interactive Media Interface Definition. Like SHARC, it uses a secure container to manage an ad experience, except that SIMID functions in the context of a media player. Discussion on whether SIMID should be extended to also handle display ads across platforms or to develop a new standard (SHARC) to handle display ads separately from the SIMID video standard was explored. The decision to create a separate standard emerged as part of the following logic.

As API specs and standards at IAB Tech Lab evolve, there is an opportunity to develop new APIs with shared design principles of existing APIs. Doing so creates a firm foundation upon which new APIs can be built more rapidly while lowering the learning curve for the industry to adopt new specs. 

SHARC has opted to share the same messaging protocol and API structure that SIMID developed in order to take full advantage of this opportunity. Sharing this core messaging structure has enabled SHARC to more rapidly prototype a spec tasked with being the cross-platform rich media successor to the Safe Frame and MRAID specs.

In adopting a lot of the API design, features and functionality, a common question asked is why shouldn’t SIMID solve all use cases?

The three main reasons are specialization, flexibility and simplicity. 



1. For specialization, SIMID was created exclusively to provide rich interactivity for streaming audio and video ads. Expanding its scope beyond its intended use case is exactly how its predecessor VPAID got into trouble. SHARC being separated as a rich media container resolves any issues with SIMID becoming overloaded. 
2. For flexibility, it allows both SIMID and SHARC to develop separately as market innovations, needs and problems to be solved potentially fork former shared priorities. 
3. For simplicity, SIMID and SHARC can keep a focused API spec relevant to each solution. SHARC has no parallel use case for certain video functions, for example. These improvements can be updated independently without forcing unnecessary version updates on technology stacks.

It is important to have different tools for different use cases. Use SIMID when working with VAST audio or video creative that need interactivity. Use SHARC when working with next-gen rich media display HTML5 creative in web and other platforms. A use case for both specs could be a VAST creative with interactivity and a companion ad as an end card. SIMID would be used to overlay the video and SHARC would be used to display the companion end card.

<h2 id="secure-by-default">Secure By Default</h2>


One of the main tenets of SHARC is the focus on providing a robust and secure communication and security framework for rich media ad experiences. The end result is that the container performs almost all the functions needed for interacting with the greater publisher content (a web page or an application). The creative must request for actions to be done on the container and the container will either resolve or reject those requests. This puts the container in control and allows for publishers to enable their expected consumer experience without an ad taking over their content. There are common uses cases covered to allow for the wide range of ad experience, but this standard ensures that an ad cannot present a poor consumer experience without the consent of the container.

<h2 id="terminology">Terminology</h2>


**Device** - The physical device such as a computer, a phone, or a tablet.

**Platform** - The operating system (OS) or windowing manager such MacOS, iOS, Android, or KDE

 \
**Host** - Window/App main content rendering area

**Publisher Content** - The Document interface that represents any web page loaded in a browser or web app and serves as an entry point into the web page's content.

**Viewport** - The part of the publisher content that is visible to the user. The browser's [viewport](https://developer.mozilla.org/en-US/docs/Glossary/Viewport) is the area of the window in which web content can be seen. This is often not the same size as the rendered page, in which case the browser provides scrollbars for the user to scroll around and access all the content.

**Container **- An object, such as an iframe or webview, that implements the SHARC API and is capable of rendering HTML.

**Container Viewport** - The part of the creative HTML that is displayed in the container.

**Displayed** - HTML content that exists in a container and is within the container viewport. This does not mean that the HTML content is visible, though.

**Navigation Event** - The call for navigation to a URL triggered in the ad creative. This action opens a new app or page, effectively abandoning the content in which the ad was being executed.

**Interaction Event** - An action that is handled inside of a creative. 

**Render vs Render on screen**

**API - **Application Programming Interface

<h2 id="api-reference">API Reference</h2>


SHARC is a set of messages and data structures that ad-rendering parties exchange using a messaging protocol.

<h3 id="reference-table-container">Reference Table: Container</h3>



<table>
  <tr>
   <td><strong>API</strong>
   </td>
   <td><strong>resolve</strong>
   </td>
   <td><strong>reject</strong>
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-container-init">SHARC:Container:init</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td><a href="#reject">reject</a>
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-container-startcreative">SHARC:Container:startCreative</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td><a href="#reject">reject</a>
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-container-statechange">SHARC:Container:stateChange</a>
   </td>
   <td>n/a
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-container-placementchange">SHARC:Container:placementChange</a>
   </td>
   <td>n/a
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-container-log">SHARC:Container:log</a>
   </td>
   <td>n/a
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-container-fatalerror">SHARC:Container:fatalError</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-container-close">SHARC:Container:close</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td>n/a
   </td>
  </tr>
</table>


<h3 id="reference-table-creative">Reference Table: Creative</h3>



<table>
  <tr>
   <td><strong>API</strong>
   </td>
   <td><strong>resolve</strong>
   </td>
   <td><strong>reject</strong>
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-createsession">SHARC:Creative:createSession</a>
   </td>
   <td>n/a
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-fatalerror">SHARC:Creative:fatalError</a>
   </td>
   <td>n/a
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-getcontainerstate">SHARC:Creative:getContainerState</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-getplacementoptions">SHARC:Creative:getPlacementOptions</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-log">SHARC:Creative:log</a>
   </td>
   <td>n/a
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-reportinteraction">SHARC:Creative:reportInteraction</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-requestnavigation">SHARC:Creative:requestNavigation</a>
   </td>
   <td>n/a
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-requestplacementchange">SHARC:Creative:requestPlacementChange</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-requestclose">SHARC:Creative:requestClose</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td>n/a
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-getfeatures">SHARC:Creative:getFeatures</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td><a href="#reject">reject</a>
   </td>
  </tr>
  <tr>
   <td><a href="#sharc-creative-request[featurename]">SHARC:Creative:request[FeatureName]</a>
   </td>
   <td><a href="#resolve">resolve</a>
   </td>
   <td><a href="#reject">reject</a>
   </td>
  </tr>
</table>


<h2 id="messages-from-the-container">Messages from the Container</h2>


SHARC specifies a group of messages that enables the container to transmit data, instructions, or state changes to the creative. The container prepends such message types with the `SHARC:Container` namespace. The container can push any messages onto the message bus using extensions. Any of the parties interacting with SHARC can read these messages as long as they are familiar with the extension(s).


`SHARC:Container` messages do not communicate ad creative states; SHARC dedicates Messages Triggered by Creative Events to report creative status. A private message bus can be created to inform internal systems on messages sent by the creative, or a public message bus can be created to share these messages to other systems, such as measurement providers.

While some `SHARC:Container` messages expect `resolve` and/or `reject` creative responses, other messages do not require replies.

<h3 id="sharc-container-init">SHARC:Container:init</h3>



The purpose of the `SHARC:Container:init` message is to relay information to the creative and prepare for the creative to start the SHARC ad experience.  See [Typical Initialization WorkFlow](#typical-initialization-workflow).


The creative must respond to `Container:init` with either [resolve](#resolve) or [reject](#reject).


```
dictionary MessageArgs {
  required EnvironmentData environmentData;
  Features supportedFeatures;
	  };
environmentData,
Information about publisher's environment and container capacities upon initialization.
supportedFeatures,
Information about features supported beyond basic functionality. Features that SHARC supports use the namespace com.iabtechlab.sharc.[featureName]. 
Other third party features will use a separate namespace.
```



```
dictionary EnvironmentData {
  required Placement currentPlacement;
  required Dataspec dataspec;
  required Data data;
  Navigation containerNavigation;
  required enum currentState;
  required string version;
  boolean isMuted;
  float volume;
};

currentPlacement,
Information about the container's current placement properties such as dimensions, location, inline or over content, etc.
dataspec,
The name and version of the dataspec that provides placement and creative information. Default dataspec is AdCOM.
data,
The data provided by the dataspec identified.
containerNavigation,
Information about how the container handles navigation. The container always handles navigation except in situations where it's not possible such is in a browser. The creative must always request navigation regardless of environment so that the container can log the instance, even if it cannot handle the navigation request.
currentState,
The current state of the container: ready, active, passive, hidden, frozen, closing, unloaded. See table for descriptions under SHARC:Container:stateChange.
version,
The full version number of the SHARC implementation.
isMuted,
True if known and device is muted.
volume,
If known, the volume level of the device, expressed as a number between 0 and 1.0. Value is -1 if unknown. 
```



```
dictionary Feature {
  string name;
  version version;
  object functions;

};

name,
The name of the feature. Features that SHARC supports use the namespace com.iabtechlab.sharc.[featureName]. Third party features will use a separate namespace.
version,
The version of the named feature.
functions,
An object array describing the available functions of the named feature.
```



```
dictionary Placement {

  required Dimensions initialDefaultSize,
  required Dimensions minDefaultSize,
  required Dimensions maxDefaultSize,
  required Dimensions maxExpandSize,
  required Dimensions viewportSize
};

initialDefaultSize
The initial dimensions of the container at the time that startCreative is called..
minDefaultSize
The minimum dimensions that the container can be in the default placement (without a request to change the placement size). If equal to initialDefaultSize, placement size cannot be smaller than default. 
maxDefaultSize
The maximum dimensions that the container can be in the default placement (without a request to change the placement size). If equal to initialDefaultSize, placement size cannot be larger than default.
viewportSize
The maximum dimensions of the window or viewport that the container is aware of. Likely, this is the screen size. 
```



```
dictionary Dimensions {
  required long width;
  required long height;
 };

width,
The width of the container in density-independent pixels (DIPS)
height,
The height of the container in density-independent pixels (DIPS)
```



```
dictionary Dataspec {
  required string model;
  required string ver;
  };

model,
The data structure model used to provide data. Default is AdCOM.
ver,
The version of the data model identified above. Default is "1.0".
```



```
dictionary Data {
  // Defined by the dataspec
  };
AdCOM example

dictionary Data {
  required AdcomAd ad;
  required AdcomPlacement placement
  required AdcomContext context
  };

data,
The data provided by the dataspec identified. Recommended AdCOM nodes:
ad (see AdCOM Ad Object)
placement (see AdCOM Placement Object)
context (see AdCOM Context Object)

```



```
dictionary Navigation {
  boolean navigationPossible;
  boolean navigationAllowed;
  };

navigationPossible,
True if the platform in which the container operates supports navigation away from the ad experience and can be handled by the container. If false, navigation away from the ad experience must be handled by the creative (if possible); however, the creative must still always request navigation so that the container can log the request.
navigationAllowed,
True if navigationPossible=true and container allows navigation away from the ad experience.

```


<h6 id="resolve">
_resolve_</h6>


The creative acknowledges the initialization parameters.


If the creative delays calling resolve, see [Creative Delays Resolving Init](#creative-delays-resolving-init)

<h6 id="reject">
_reject_</h6>


The creative may respond with a reject based on its internal logic.


```
dictionary MessageArgs
{
  required unsigned short errorCode;
  DOMString reason;
};

errorCode, 
See Error Codes. 
reason, 
Optional information about cause of rejection. 
```


The container then will follow the rejection workflow. See [Creative Rejects Init](#creative-delays-resolving-init).

<h3 id="sharc-container-startcreative">SHARC:Container:startCreative</h3>


See [Typical Initialization Workflow](#typical-initialization-workflow)

The container posts `SHARC:Container:startCreative` message when it is ready to make the iframe visible. The container waits for a `resolve` response to display itself. The interactive creative should be ready to reply to `Container:startCreative` immediately.

[SHARC:Container:init](#sharc-container-init) section describes the flow that precedes the instant the container emits a `Container:startCreative` message.

<h6 id="resolve">_resolve_</h6>


By posting `resolve`, the interactive creative acknowledges that it is ready for display. The creative should be ready to respond immediately. The container makes itself visible upon a resolve receipt 

Refer to [Typical Initialization WorkFlow](#typical-initialization-workflow). 

<h6 id="reject">_reject_</h6>


When the creative responds with a reject, the container may unload the ad. The player reports an error tracker with the `errorCode` the creative supplied. 


```
dictionary MessageArgs{
  required unsigned short errorCode;
  DOMString reason;
};

errorCode, 
See Error Codes. 
reason, 
Additional information. 
```


<h3 id="sharc-container-statechange">SHARC:Container:stateChange</h3>


The container posts a SHARC:Container:stateChange message whenever the container state is changed. Certain container or environment events can trigger a state change. For example, Container:init triggers the “ready” state. Or a change in focus, such as when a user switches tabs in a browser, can change the state from “active” or “passive” to “hidden.” The new container state is reported with the message.


```
dictionary MessageArgs{
  DOMString containerState;
  };

containerState, 
The current (new) container state, which is one of: created, ready, active, inactive, closing, destroyed. See reference chart below for definitions of states.

```


<h4 id="table-of-possible-container-states">Table of possible container states</h4>




<p id="gdcalert1" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image1.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert2">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image1.png "image_tooltip")



<table>
  <tr>
   <td><strong>State</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>created
   </td>
   <td>The container has created the container but has not yet initialized the container. The creative may or may not have started the session yet.
<p>
<strong>Possible previous states:</strong>
<p>
(none)
<p>
<strong>Possible next states:</strong>
<p>
active
<p>
destroyed (if the start session times out or some other error occurs)
<p>
Note: This event is not be queryable by the creative but represents a state of SHARC before the container and creative handshake is ready for bidirectional communication.
   </td>
  </tr>
  <tr>
   <td>ready
   </td>
   <td>The container has successfully completed initialization (Container:init) and is ready for the creative to start.
<p>
<strong>Possible previous states:</strong>
<p>
created
<p>
<strong>Possible next states:</strong>
<p>
active 
   </td>
  </tr>
  <tr>
   <td>active
   </td>
   <td>Container is currently in a space that is visible and in use (has focus and input)
<p>
<strong>Possible previous states:</strong>
<p>
ready (Container:init)
<p>
inactive
<p>
<strong>Possible next states:</strong>
<p>
inactive
<p>
closing
   </td>
  </tr>
  <tr>
   <td>inactive
   </td>
   <td>Container is currently in a space that is visible but no longer in use (has focus but no input).
<p>
<strong>Possible previous states:</strong>
<p>
active
<p>
<strong>Possible next states:</strong>
<p>
active
<p>
closing
   </td>
  </tr>
  <tr>
   <td>closing
   </td>
   <td>The close sequence has been initiated and the container is in a state of closing.
<p>
<strong>Possible previous states:</strong>
<p>
active
<p>
inactive
<p>
<strong>Possible next states:</strong>
<p>
destroyed
   </td>
  </tr>
  <tr>
   <td>destroyed
   </td>
   <td>The container has unloaded and can no longer function.
<p>
<strong>Possible previous states:</strong>
<p>
closing 
<p>
<strong>Possible next states:</strong>
<p>
(none)
<p>
Note: This event is not be queryable by the creative but represents a state of SHARC after the container and creative handshake has ended and no bidirectional communication is possible anymore.
   </td>
  </tr>
</table>


The creative can request the current state of the container any time using [Creative:getContainerState](#sharc-creative-getcontainerstate).

<h3 id="sharc-container-placementchange">SHARC:Container:placementChange</h3>


When the container changes its properties, such as dimensions and location (usually in response to a request by the creative), it posts the `SHARC:Container:placementChange` message. The message describes the container dimensions and coordinates.


```
dictionary MessageArgs{
  required Placement placementUpdate;
  };

placementUpdate,
Information about changes in the container properties, such as dimensions and location.
```



```
dictionary Placement {
  Dimensions containerDimensions;
  boolean inline;
  enum standardSize;
  array dynamicFeatures;

};

containerDimensions,
The standard dimensions and coordinates of the container. 
inline,
True if the container is anchored within the content the platform is presenting. False if the container is placed over the content.
standardSize,
Indicates whether the current dimensions are one of a standard size: default, max, min.
default: the initial size of the container
max: the standard maximum size the container allows. Maximum size may or may not be the full view available to the container but is the max size allowed.
min: the minimum standard size the container offers. 


```



```
dictionary Dimensions {
  required long x;
  required long y;
  required long width;
  required long height;
  enum anchor;
 };

x,
The x coordinate of the container anchor point.
y,
The x coordinate of the container anchor point.
width,
The width of the container in density-independent pixels.
height,
The height of the container in density-independent pixels.
anchor,
The anchor corner of the container: top-left, top-right, bottom-left, bottom-right. Default is top-left.
```


See [SHARC:Creative:requestPlacementChange](#sharc-creative-requestplacementchange)

<h3 id="sharc-container-log">SHARC:Container:log</h3>


The purpose of the Container:log message is to convey optional, primarily debugging, information to the creative. 


```
Note: In SHARC prefixing log messages with "WARNING:" has a specific meaning. The container is communicating performance inefficiencies or specification deviations aimed at creative developers. For example, if the creative sends the requestPlacementChange message but does not use the correct parameters (dimensions and coordinates), a "WARNING:" message is appropriate.
```



```
dictionary MessageArgs{
  required DOMString message;
};

message, 
Logging information. 
```


<h3 id="sharc-container-fatalerror">SHARC:Container:fatalError</h3>


The container posts a `SHARC:Container:fatalError` message when it encounters exceptions that disable any further function. If feasible, the container waits for `resolve` response from creative before unloading.

See Container errors out


```
dictionary MessageArgs{
  required unsigned short errorCode;
  DOMString errorMessage;
};

errorCode, 
See Error Codes
errorMessage, 
Additional information 
```


<h6 id="resolve">_resolve_</h6>


The creative must respond to `Container:fatalError` with `resolve`. After `resolve` arrives, the container unloads. 

See Creative Errors Out

<h3 id="sharc-container-close">SHARC:Container:close</h3>


The container provides a close control and handles the` Container:close` and subsequent` Container:unload` events. If supported, the container may allow the creative to run a close sequence that is no more than 2 seconds long.

The container issues Container:close when:



* The user activates the close control 
* The creative requests close with Creative:requestClose
* Something in the content platform requires the container to close
<h6 id="resolve">
resolve</h6>



The creative responds with resolve to acknowledge that the container is going to close. The container may proceed to unload with or without creative response. If supported, the container may wait for up to 2 seconds to allow the creative to run a close sequence.

<h2 id="messages-from-the-creative-to-the-container">Messages from the Creative to the Container</h2>


The creative posts messages to the container to request container state changes, obtain data, and to send notifications. The creative prefixes its messages with the namespace `SHARC:Creative`. 

`SHARC:Creative` messages may require the container to accept and process arguments. With some messages, the creative expects the container to respond with resolutions.

<h3 id="sharc-creative-createsession">SHARC:Creative:createSession</h3>


The creative posts `SHARC:Creative:createSession` when the creative is ready to send and receive SHARC API messages.

<h3 id="sharc-creative-fatalerror">SHARC:Creative:fatalError</h3>


The creative posts `SHARC:Creative:fatalError` in cases when its internal exceptions prevent the interactive component from further execution. In response to the `Creative:fatalError` message, the container unloads the SHARC iframe and reports the `errorCode` specified by the creative. 


```
dictionary MessageArgs{
  required unsigned short errorCode;
  DOMString errorMessage;
};

errorCode, 
See Error Codes. 
errorMessage, 
Additional information. 
```


<h3 id="sharc-creative-getcontainerstate">SHARC:Creative:getContainerState</h3>


The creative posts a `SHARC:Creative:getContainerState` message to request the current container state.

<h6 id="resolve">
_resolve_</h6>


The container should always respond with `resolve`.


```
dictionary MessageArgs{
  enum currentState;
  };

currentState, 
The current container state, which is one of: ready, active, inactivepassive, hidden, frozen, closing, destroyedunloaded. See Table of Possible Container States for definitions of states.
```


<h3 id="sharc-creative-getplacementoptions">SHARC:Creative:getPlacementOptions</h3>


The creative posts a `SHARC:Creative:getPlacementOptions` message to request information about placement options. 

<h6 id="resolve">
_resolve_</h6>


The container should always respond with `resolve`, including in situations when the container is unable to provide all expected values.


```
dictionary MessageArgs{
  required Placement currentPlacementOptions;
  };

currentPlacementOptions,
Information about current container properties, such as dimensions and location.

dictionary Placement {
  Dimensions containerDimensions;
  boolean inline;
  };

containerDimensions,
The standard dimensions and coordinates of the container. 
inline,
True if the container is anchored within the content of the platform. False if the container is placed over the content.

```


<h3 id="sharc-creative-log">SHARC:Creative:log</h3>


The message `SHARC:Creative:log` enables the creative to communicate arbitrary information to the player. 


```
Note: If the log message purpose is to notify the container about the container's non-standard behavior, the creative prepends  Message.args.message with "WARNING:" in the string. Warning messages are used to inform container developers about occurrences of non-fatal issues.
```



```
dictionary MessageArgs{
  required DOMString message;
};

message, 
Logging information. 
```


<h3 id="sharc-creative-reportinteraction">SHARC:Creative:reportInteraction</h3>


The `SHARC:Creative:reportInteraction` message enables a creative to delegate arbitrary non-navigation interaction metrics to the container. Standard interactions and macros are maintained separately from SHARC, so that an update to interaction metrics or macros doesn’t require a new version of SHARC.

These interaction metrics are URIs into which the creative may inject macros.

In response to the `reportInteraction` message, the container must:



* Send the trackers specified by the message as soon as possible.
* Replace any macros in the dataspec with the corresponding values.
* Accept and send the trackers with custom macros – leave non-standard macros intact unless the publisher-ad integration involves custom macros processing.

    ```
dictionary MessageArgs{
  required Array trackingUris;
};

trackingUris, 
Array of URIs. 
```



<h6 id="resolve">resolve</h6>


The player posts a `resolve` after it sends the trackers. 

<h3 id="sharc-creative-requestnavigation">SHARC:Creative:requestNavigation</h3>



The creative posts the` SHARC:Creative:requestNavigation` message when an interaction or some other event has triggered navigating to the creative’s clickthrough URI. 


The container handles all navigation in situations where the function is available to the container. In some situations, such as in web, navigation is handled by the browser. However, even when the container cannot handle navigation to the creative’s link, _the creative must always request navigation_ so that the container is aware.


Navigation capabilities are provided upon initiation. See SHARC:Container:init.supports.navigation for details.

<h3 id="sharc-creative-requestplacementchange">SHARC:Creative:requestPlacementChange</h3>


The creative posts the SHARC:Creative:requestPlacementChange message when the creative would like the container to modify its properties, such as size. 


```
dictionary MessageArgs{
  required Placement changePlacement;
};

changePlacement, 
Information about what container properties the creative would like to change.

dictionary Placement {
  Dimensions containerDimensions;
  boolean inline;
  };

containerDimensions,
The standard dimensions and coordinates of the container. 
inline,
True if the container is anchored within the content of the platform. False if the container is placed over the content.

```


<h6 id="resolve">resolve</h6>


The container should always respond with `resolve`, including in situations when the container is unable to provide all expected values. The container should also post the [SHARC:Container:placementChange ](#sharc-container-placementchange)message with updates to any changes in properties to the container.

<h3 id="sharc-creative-requestclose">SHARC:Creative:requestClose</h3>


The container ALWAYS handles closing the container, including providing the close function. However, if the creative has a reason to close the container before the container’s close control is activated, the creative can post the SHARC:Creative:requestClose message to ask the container to close.

<h6 id="resolve">resolve</h6>



If the container can close, it responds with a `resolve`.

<h6 id="reject">reject</h6>



If the container cannot close, it responds with a `reject`. 


With the requestClose rejection: 



* The container maintains its current state.
* The container continues posting messages as appropriate.
* The creative may unload and send a Creative:log message to report that it has unloaded.

<h3 id="sharc-creative-getfeatures">SHARC:Creative:getFeatures</h3>


The creative uses getFeatures to return a list of supported features..

<h6 id="resolve">resolve</h6>



The container returns a list of supported features.

<h3 id="sharc-creative-request[featurename]">SHARC:Creative:request[FeatureName]</h3>


The creative uses request[FeatureName] to initiate a supported feature. The SHARC container must be aware of and have implemented the named feature to execute it.

<h6 id="resolve">resolve</h6>



The container responds with resolve upon execution of the feature and provides any relevant details as defined by the feature.

<h6 id="reject">reject</h6>



If the container cannot execute the requested feature or is unaware of the feature, it responds with a `reject`. 


With the requestFeature rejection: 



* The container maintains its current state.
* The container continues posting messages as appropriate.

<h2 id="extensions-supported-features">Extensions (Supported Features)</h2>


SHARC cannot account for all possible use cases. In these circumstances, SHARC implementers may include one or more extensions. Any extensions can be provided in the Supports node in init or by querying the container for extensions.

SHARC maintains two types of feature extensions: SHARC-supported features and third party supported features. SHARC-supported features use the namespace `com.iabtechlab.sharc.[featureName]`. The nomenclature for third-party supported features is similar: `com.3rdpartyurl.sharc.[featureName]`.

As long as the feature extensions are known and the technical functionality to support the feature is built in, any functionality can be built into SHARC by extension.

<h3 id="integration-with-iab-tech-lab-open-measurement">Integration with IAB Tech Lab Open Measurement</h3>


SHARC is designed to support additional features and integrations using its supported features extensions. Working with Open Measurement in SHARC requires that the container implementation supplies the functionality to execute the supported feature and that the creative knows how to call the feature. 

The Safe Ad Container working group will work with the Open Measurement to develop guidance on the use of a supported Open Measurement feature. As more resources become available, they will be posted at [iabtechlab.com/sharc](iabtechlab.com/sharc).

<h2 id="common-workflows">Common Workflows</h2>


To help SHARC developers and implementers, we’ve outlined some common workflows to demonstrate the functionality of SHARC as intended. 

<h3 id="loading-ad-lifecycle">Loading (Ad Lifecycle)</h3>


(creating container, preparing to execute ad)

Define the end-to-end lifecycle and break down by states



<p id="gdcalert2" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image2.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert3">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image2.png "image_tooltip")


<h3 id="typical-initialization-workflow">Typical Initialization Workflow</h3>




1. SHARC container is created and waits for a creative.
2. Creative gets added to the SHARC enabled container
3. Create Session happens
    * Creative asks for session
    * Resolve: Container creates session and sends info about what’s next (container set up)
    * Reject: If session not created, reject includes details about why
4. Container set up
    * Container sets up container
        * Sends details about environment, settings, etc. to creative
        * Use case: mute button settings defined, creative sets creative with defined settings, tells container that it’s ready
    * Creative must respond with resolve and reply with ready details. In the case of critical error, creative responds with reject and reports the error.
        * Resolve: includes setting details
        * Reject: critical error prevents creative from achieving ready state. The container is free to close and load something else.
5. Start Creative (time to play the ad)
    * Getting to this point means that both container/creative have said they’re ready to go and everything is in place.

<h3 id="non-sharc-creatives">Non-SHARC Creatives</h3>


SHARC as a container standard expects SHARC enabled creatives. However, as part of this standard, a SHARC enabled container must be able to render a standard HTML type of creative within its secure container, if possible, based on the container runtime environment. While the ad experience will not be as robust as a SHARC enabled experience, the publisher content will be protected by wrapping the creative in a secure container. 

However, SHARC dictates an initialization and start workflow for creatives. In cases where the creative won’t respond to the container, the container may assume that the creative is malfunctioning unless the creative gives a hint to the container that it isn’t SHARC enabled. As more detailed guidance becomes available, it will be posted to [iabtechlab.com/sharc](iabtechlab.com/sharc). 

<h3 id="how-to-handle-close-sequence">How to Handle Close Sequence</h3>


The container always handles close, but may allow for the creative to run a brief close (max 2 seconds) sequence upon initiating close to report and need tracking. Upon close, the container unloads the creative and the container.



* User initiates close using container-provided close feature.
* Container reports that close has been initiated.
* If the container allows close sequence, it allows 2 seconds for the creative to run a close sequence, but the container may also close instantly.
* Container executes close. 

Note: Each SHARC instance only ever contains one ad. If a container wants to replace a closed ad with a new ad, it must unload an existing instance. The container then initiates a new instance for a new ad. If a container is reloading the same ad after a close, it must still be done within a new instance of the container.

<h3 id="how-container-provides-close-control">How Container provides close control</h3>


SHARC mandates that the container provide the needed functionality for a user to close the ad experience. While the creative can opt to provide its own control, the container must present a control in a style that is consistent with the workflow governed by the container implementation. In general, it is assumed that the majority of close controls will be a button in the top right at a size of 50x50 DIPs. This is the most common type of close control and is recommended in most cases.

However, this top right button can be replaced with a different type of close control as long as it is obvious to a user. For instance, if an application is a gallery of pictures that users swipe to go back and forth, the close control for an interstitial ad can be a swipe gesture since it is obvious to the user based on the preceding navigation.

The container must always provide a close control that is obvious to a user to close the ad experience.

<h3 id="creative-delays-resolving-init">Creative Delays Resolving Init</h3>


The creative response to SHARC:Container:Init should be instant. If the creative does not respond to init within 2 seconds, the container may assume that creative cannot load and is free to unload the current instance and start a new one with a new ad. This delay in response can be handled the same way as if the creative sent a reject response (see Creative Rejects Init)

<h3 id="creative-rejects-init">Creative Rejects Init</h3>


In the event that the creative rejects the container init message, the container assumes that there is a payload that is not functioning. In effect, this means that the container can be ready for another creative by disregarding the current payload. In this case, the container can do a few options, depending on the implementation desired. The listed options are not exhaustive. It is the container that will determine the best user experience and as such should maintain proper user workflow given the needs of the implementation.



1. Hide the SHARC container view.
2. Request a new ad.

<h2 id="error-handling-and-timeouts">Error Handling and Timeouts</h2>


If the creative cannot be executed the container should terminate the ad and fire an error.

If either the creative or container wants to terminate with an error the player should fire a 902 error. The creative or container should pass a specific error code to indicate why it errored out. The creative can also hand back a string with extra details about the error.

<h3 id="error-codes">Error Codes</h3>



<table>
  <tr>
   <td>Code
   </td>
   <td>Error
   </td>
   <td>Description
   </td>
  </tr>
  <tr>
   <td>2100
   </td>
   <td>Unspecified creative error
   </td>
   <td>Catchall error when no existing code matches the error. Creative errors should be as specific as possible.
   </td>
  </tr>
  <tr>
   <td>2101
   </td>
   <td>Resources could not be loaded
   </td>
   <td>The SHARC creative tried to load resources but failed.
   </td>
  </tr>
  <tr>
   <td>2102
   </td>
   <td>Container dimensions not suited to creative
   </td>
   <td>The container dimensions provided were unmatched to the dimensions the creative specified. 
   </td>
  </tr>
  <tr>
   <td>2103
   </td>
   <td>Wrong SHARC version
   </td>
   <td>The creative could not support the container’s version of SHARC.
   </td>
  </tr>
  <tr>
   <td>2104
   </td>
   <td>Creative could not be executed
   </td>
   <td>For an unspecified technical reason, the creative could not be executed.
   </td>
  </tr>
  <tr>
   <td>2105
   </td>
   <td>Resize request not honored
   </td>
   <td>The container rejected the creative’s resize request.
   </td>
  </tr>
  <tr>
   <td>2108
   </td>
   <td>Ad internal error
   </td>
   <td>The creative had an error not related to any external dependencies.
   </td>
  </tr>
  <tr>
   <td>2109
   </td>
   <td>Device not supported
   </td>
   <td>The creative could not render or execute on the device.
   </td>
  </tr>
  <tr>
   <td>2110
   </td>
   <td>Container not sending messages as specified
   </td>
   <td>The container is sending messages but not according to spec. Messages are confusing, labeled incorrectly, or not listed.
   </td>
  </tr>
  <tr>
   <td>2111
   </td>
   <td>Container not responding adequately to messages
   </td>
   <td>Container is responding to messages but is delayed or without expected information.
   </td>
  </tr>
  <tr>
   <td>2200
   </td>
   <td>Unspecified container error
   </td>
   <td>Catchall error when no existing code matches the error. Container errors should be as specific as possible.
   </td>
  </tr>
  <tr>
   <td>2201
   </td>
   <td>Wrong SHARC version
   </td>
   <td>The container could not support the creative’s version of SHARC.
   </td>
  </tr>
  <tr>
   <td>2203
   </td>
   <td>SHARC creative requesting more functionality than container willing to support
   </td>
   <td>The creative may be requesting features that are unknown to the container or that the container doesn’t support.
   </td>
  </tr>
  <tr>
   <td>2204
   </td>
   <td>SHARC creative executing actions not supported
   </td>
   <td>While creative execution should be isolated from publisher content in a SHARC container, the creative may be attempting to execute unsupported features.
   </td>
  </tr>
  <tr>
   <td>2205
   </td>
   <td>SHARC creative is overloading the postmessage channel
   </td>
   <td>The creative is sending too many messages.
   </td>
  </tr>
  <tr>
   <td>2208
   </td>
   <td>SHARC creative taking too long to resolve or reject message(s)
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>2209
   </td>
   <td>SHARC creative provided is not supported on this device
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>2210
   </td>
   <td>creative is not following the spec when initializing
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>2211
   </td>
   <td>creative is not following the spec in the way it sends messages
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>2212
   </td>
   <td>creative did not reply to the initialization message
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>2213
   </td>
   <td>creative did not reply to the start message
   </td>
   <td>
   </td>
  </tr>
</table>


<h2 id="messaging-protocol">Messaging Protocol</h2>



In SHARC, the media container and the creative overlay communicate by exchanging asynchronous signals that maintain a custom messaging protocol. 


This protocol governs: 



* [Data Layer](#data-layer)
* [Transport Layer](#transport-layer)
* [Session Layer](#session-layer)
<h3 id="data-layer">
Data Layer</h3>



SHARC messages transport data. In HTML environments, the data is the `message` argument of the `Window.postMessage()` function. 

<h4 id="data-structure">
Data Structure</h4>


The `message` data implements the following data structure for an HTML environment:


```
dictionary Message{
  required DOMString sessionId;
  required unsigned long messageId;
  required unsigned long timestamp;
  required DOMString type;
  any args;
};
```



**<code>sessionId</code>, </strong>


    A string that uniquely identifies the session to which Message belongs. See [Session Layer.](#session-layer) 


**<code>messageId</code>, </strong>


    A message sequence number in the sender’s system. Each participant establishes its own independent sequence counter for the session. The first message  `messageId` value is `0`. The sender increments each subsequent messageId value by `1`. In practice, this means that the creative and the container `messageId` values will be different based on the number of sent messages. 


**<code>timestamp</code>, </strong>


    A number of milliseconds since January 1, 1970, 00:00:00 UTC (Epoch time). The message sender must set the `timestamp` value as close as possible to the moment the underlying process occurs. However, the receiver should not assume that the `timestamp` value reflects the exact instant the message-triggering event occurred, not necessarily the time of the event. 


**<code>type</code>, </strong>


    A string that describes the message-underlying event and informs the receiver how to interpret the `args` parameter. 


**<code>args</code>, </strong>


    Additional information associated with the message `type`. 


**Example of message data:**


```
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 10,
    timestamp: 1564501643047,
    type: "SHARC:Container:adClosed",
    args: {
        code: 0
    }
}
```


<h4 id="messages-categories">
Messages Categories</h4>


The protocol defines two message classes:



* **_Primary_** messages - the signals triggered by the sender’s internal logic.
* **_Response_** messages - the signals the receiver transmits as acknowledgments of the primary message receipt and processing. There are two response Message types: resolve Messages and reject Messages.

Both primary and response messages implement the same data structure (see [Data Structure](#data-structure)).

<h5 id="resolve-messages">
`resolve` Messages</h5>



The receiver confirms successful message processing by replying with a resolution message.

`Message.type` must be `resolve`.

`Message.args` must be a `ResolveMessageArgs` object:


```
dictionary ResolveMessageArgs{
    required unsigned long messageId;
    any value;
};
```



**<code>messageId</code>, </strong>


    The value of the messageId attribute of the message to which the receiver responds. 


**<code>value</code>, </strong>

Additional data associated with this `resolve` message. 


**Example of <code>resolve</code> message:</strong>


```
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 10,
    timestamp: 1564501643047,
    type: "resolve",
    args: {
        messageId: 5,
        value: {
            id: 45
        }
    }
}
```


<h4 id="reject-messages">
**<code>reject</code> Messages</strong></h4>


When the receiver is unable to process the message (or refuses it), it responds with rejection.

`Message.type` must be `reject`.

`Message.args.value` must be a `RejectMessageArgsValue` object:


```
dictionary RejectMessageArgsValue{
   required unsigned long errorCode;
   DOMString message;
};
```



**<code>errorCode</code>, </strong>


    The error code associated with the reason the receiver `rejects` the message. 


**<code>message</code>, </strong>

Additional information. 


**Example of <code>reject</code> message:</strong>


```
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 10,
    timestamp: 1564501643047,
    type: "reject",
    args: {
        messageId: 5,
        value: {
            errorCode: 902,
            message: "The feature is not available."
        }
    }
}
```


<h3 id="transport-layer">
Transport Layer</h3>


Transport is a communication mechanism that can send serialized messages between two parties.

<h4 id="postmessage-transport">
**<code>postMessage</code> Transport</strong></h4>


In HTML environments, where the container loads creative overlay in a cross-origin iframe, the parties utilize the standard `Window.postMessage()` API as the message transport mechanism.

<h4 id="message-serialization">
**Message Serialization**</h4>


The message sender serializes data into a `JSON` string. The deserialized `JSON` must result in a clone of the original Message data object.

In JavaScript, `JSON.stringify()` performs serialization; `JSON.parse()` - deserialization.

<h3 id="session-layer">
Session Layer</h3>


The media container may manage several ads that are in different phases of their lifespans; multiple concurrent sessions may be active. For example, while the container is rendering ad-A, it preloads and engages ad-B. Simultaneous two-way communication between the container and both ads persists.

Each session has a unique identifier. All messages that belong to a specific session must reference the same session id.

<h4 id="establishing-a-new-session">
Establishing a New Session</h4>



The `createSession` message is the signal from the creative to the SHARC container that the underlying rich media is ready to proceed in the ad lifecycle and ready to send and receive further messages.

SHARC delegates the session initialization to the creative overlay. The creative generates a unique session id and posts the first session message with the `Message.type createSession`. By posting the `createSession `message, the creative acknowledges its readiness to receive messages from the container.


Note: There is no expectation for the interactive component to be entirely able to participate in ad rendering at the time the creative signals `createSession` message. Full creative initialization may occur at later stages when the container provides complete data - see [§ 4.3.7 SHARC:container:init](https://interactiveadvertisingbureau.github.io/SIMID/#simid-player-init).


**Example of <code>createSession</code> Message data:</strong>


```
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 0,
    timestamp: 1564501643047,
    type: "createSession",
    args: { }
}
```


Creative should initialize the session as soon as possible. The container should establish a reasonable timeout for the session initialization message receipt.

The container responds to `createSession` with a `resolve` message.

_Typical Session Initialization Sequence_



<p id="gdcalert3" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image3.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert4">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image3.png "image_tooltip")




1. The container starts a `createSession` message timeout.
2. The container loads creative.
3. Creative posts `createSession` message.
4. The container cancels the timeout.
5. The container responds with a `resolve` message.
6. The container initializes creative. See [SHARC:container:init](#sharc-container-init).
<h4 id="session-establishing-delays-and-failures">
Session Establishing Delays and Failures</h4>



Typically, the container should wait for the creative to post a `createSession` message before proceeding to the simultaneous rendering of both ad media and the interactive component. However, SHARC recognizes scenarios when:



* The creative fails to establish a session within the allotted time.
* The container’s environment restricts timeout usage (effectively, the timeout is zero). Specifically, SSAI and live broadcasts force zero-timeout use cases.

The creative’s failure to establish a session does not prevent the container from rendering the ad media. If the creative does not post a `createSession` message on time, the container may proceed with the ad media rendering. However, the container allows the creative to recover in the middle of the ad media playback. The container:



* Does not unload the creative.
* Does not post messages to the creative.
* Maintains the `creativeSession` message handler. 

If the creative has not established a session before the media playback is complete, the container will report a VAST Error tracker with the proper error code. Examples of situations when this may occur are listed below.

**Sequence for a failed session initialization**



1. The timeout expires.
2. The `createSession` message does not arrive.
3. The container starts ad media.
4. The container reports the impression.
5. The ad media playback completes.
6. The container reports the VAST error tracker.
7. The container unloads the creative iframe.

**Creative posts a <code>createSession</code> message after the timeout occurs</strong>



1. The timeout expires.
2. The container retains the interactive component.
3. The container initiates ad media playback.
4. The container reports the impression.
5. The container does not post messages to the creative.
6. The creative posts `createSession` message.
7. The container proceeds with the creative initialization.

<h2 id="compatibility-modes">Compatibility Modes</h2>


SHARC does NOT support MRAID or SafeFrame, but for adoption SHARC is working on bridge layers to work with MRAID or SafeFrame. 

<h3 id="compatibility-mode-with-mraid">Compatibility Mode with MRAID</h3>


The SHARC working group is working on a compatibility bridge to enable transitioning from MRAID to SHARC.

<h3 id="compatibility-mode-with-safeframe">Compatibility Mode with SafeFrame</h3>


The SHARC working group is working on a compatibility bridge to enable transitioning from MRAID to SHARC.
