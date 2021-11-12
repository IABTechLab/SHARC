# DRAFT INSPRIATION FROM SIMID

# API Reference

## SHARC:Container:init
The purpose of the SHARC:Container:init message is to transport data to assist with the creative initialization process. See § 6.2 Typical Initialization WorkFlow and § 6.4 Uninterrupted Initialization WorkFlow. (TODO: determine where to put on doc)

The creative must respond to the SHARC:Container:init message with either § 4.3.7.1 resolve or § 4.3.7.2 reject. (TODO)
```
dictionary MessageArgs
 {
  required EnvironmentData environmentData;
  required MetaData metaData;
  optional IdentifyData identityData;
};

environmentData,
    Information about container's environment and capacities. 
metaData,
    Information about how to handle certain types of clickthroughs and other specific user workflow items //TODO: Revisit use cases
identityData
    Information about the specific user or device.
```

```
dictionary environmentData {
  required Dimensions containerDimensions; 
  required boolean fullscreen;
  required boolean fullscreenAllowed; // TODO: Follow up on this
  required DOMString version;
  DOMString siteUrl;
  DOMString appId;
  DOMString deviceId;
  boolean muted;
  float volume;
  DOMString sdk; // the company and product or service making the request
  DOMString sdkVersion;
  dictionary identityData; // any data for identifying things like GDPR string, etc. TODO: more to flesh out? document list of possibilities. (MRAID had "limit tracking" for example)
  NavigationSupport navigationSupport; // Do we include this and how do we define it? This is about the click and who handles it: container or creative. Note: consider a compatibility mode that allows non-SHARC creative to execute in SHARC container.
  CloseInteractionSupport closeInteractionSupport; // container ALWAYS handles this and not allow creative to operate. But container could offer options such: white for black bkgd, or black for white background, or left/right, etc. Might not be a button; might be a swipe or other gesture. This data point not needed because it will be understood that container always provides close, but other creative doc needed on things like how to provide the close button/option, creative, communication, tech operation.
};

dictionary Dimensions {
  required long x;
  required long y;
  required long width;
  required long height;
}; // density-independent pixels



enum NavigationSupport {"containerHandles", "notSupported"}; // TODO: determine how clicks handled and what options offered
enum CloseInteractionSupport {}; // TODO: update to possibly provide close options

containerDimensions,
    Communicates container coordinates and size when the container is present in the view hiearchy. -1 indicates an unknown value. 
fullscreen,
    The value true indicates that the container is currently in fullscreen mode. 
fullscreenAllowed,
    Communicates the container's capacity to toggle screen modes.

        The value true indicates that creative may request screen mode change.
        The value false denotes that the container will reject calls to change screen mode.* 
version,
    The SHARC version the container implements. 
muted,
    true if the environment § is muted.◊ 
volume,
    environment's § volume – expressed as a number between 0 and 1.0. 
sdk,
    Used for debugging purposes. The SDK provider. (IE: If a network provides the SDK to a publisher, put the name of the network or the specific product name)
sdkVersion,
    Used for debugging purposes. The SDK version that the container uses. 
siteUrl,
    The URI of the publisher’s site. May be full or partial URL. 
appId,
    The ID of the mobile app, if applicable. 
navigationSupport,
    Indicates how clickthroughs should be handled. //TODO: Update description when use cases are discovered.

closeInteractionSupport,
    //TODO: Update description when use cases are discovered.
```

```
dictionary MetaData {

}; // TODO: determine use cases for this. Data that is not about the environment but additional data that might be needed (enriched data). Determine list of metadata to use.

```

```
dictionary IdentityData {
  DOMString ifa;
  DOMString useragent;
  DOMString cookieid;
  DOMString consentString;

}; // TODO: What optional information can we pass here. Note, this doesn't mean they will be, just what CAN be passed.

```

    SHARC does not expect device audio state information to be available at all times.
    Values of muted and volume are independent. While the player is muted, volume can be greater than zero; the volume zero does not mean the environment is muted. 

### resolve

The creative acknowledges the initialization parameters.

If the creative delays calling resolve, see § 6.5 Creative Delays Resolving Init.
### reject

The creative may respond with a reject based on its internal logic.
```
dictionary MessageArgs
 {
  required unsigned short errorCode;
  DOMString reason;
};

errorCode,
    See Error Codes. (TODO)
reason,
    Optional information about rejection cause. 
```
The player then will follow the rejection workflow. See Creative Rejects Init. (TODO)

# Messaging Protocol
In SHARC, the container and the creative communicate by exchanging asynchronous signals that maintain a custom messaging protocol. This protocol governs [8.1 Data Layer](#81-data-layer), [8.3 Transport Layer](#83-transport-layer), and [8.4 Session Layer](#84-session-layer).

## 8.1. Data Layer
SHARC messages transport data. In HTML environments, the data is the `message` argument of the Window.postMessage() function.

### 8.1.1. Data Structure
The `message` data implements the following data structure:
```
dictionary Message {
	required DOMString sessionId;
	required unsigned long messageId;
	required unsigned long timestamp;
	required DOMString type;
	any args;
}
```
`sessionId`
A string that uniquely identifies the session to which Message belongs. See [8.4 Session Layer](#84-session-layer).

`messageId`
A message sequence number in the sender’s system. Each participant establishes its own independent sequence counter for the session. The first message `messageId` value is `0`. The sender increments each subsequent messageId value by `1`. In practice, this means that the creative and the container `messageId` values will be different based on the number of sent messages.

`timestamp`
A number of milliseconds since January 1, 1970, 00:00:00 UTC (Epoch time). The message sender must set `timestamp` value as close as possible to the moment the underlying process occurs. However, the receiver should not assume that the `timestamp` value reflects the exact instant the message-triggering event occurred.

`type`
A string that describes the message-underlying event and informs the receiver how to interpret the `args` parameter.

`args`
Additional information associated with the message `type`.

Example of message data:
```
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 10,
    timestamp: 1564501643047,
    type: "SHARC:Player:adStopped",
    args: {
        code: 0
    }
}
```

## 8.2. Messages Categories
The protocol defines two message classes:

- Primary messages - the signals triggered by the sender’s internal logic.
- Response messages - the signals the receiver transmits as acknowledgments of the primary message receipt and processing. There are two response Message types: [8.2.1 resolve Messages](821-resolve-messages) and [8.2.2 reject Messages](#822-reject-messages).

Both primary and response messages implement the same data structure (see [8.1.1 Data Structure](#811-data-structure)).

### 8.2.1. resolve Messages
The receiver confirms successful message processing by replying with a resolution message.

`Message.type` must be `resolve`.

`Message.args` must be a `ResolveMessageArgs` object:
```
dictionary ResolveMessageArgs {
    required unsigned long messageId;
    any value;
};
```

`messageId`
The value of the `messageId` attribute of the message to which the receiver responds.

`value`
Additional data associated with this `resolve` message.

Example of `resolve` message:
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

### 8.2.2. reject Messages
When the receiver is unable to process the message, it responds with a rejection.

`Message.type` must be `reject`.

`Message.args.value` must be a `RejectMessageArgsValue` object:

```
dictionary RejectMessageArgsValue {
    unsigned long errorCode;
    DOMString message;
};
```

`errorCode`
The error code associated with the reason the receiver rejects the message.

`message`
Additional information.

Example of `reject` message:
```
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 10,
    timestamp: 1564501643047,
    type: "resolve",
    args: {
        messageId: 5,
        value: {
            errorCode: 902,
            message: "The feature is not available."
        }
    }
}
```
## 8.3. Transport Layer
The transport layer is a communication mechanism that can send serialized messages between two parties.

### 8.3.1. `postMessage` Transport
In HTML environments, where the container is a secure IFrame, the parties utilize the standard `Window.postMessage()` API as the message transport mechanism.

### 8.3.2. Message Serialization
The message sender serializes data into a JSON string. The deserialized JSON must result in a clone of the original Message data object.

In JavaScript, `JSON.stringify()` performs serialization; `JSON.parse()` - deserialization.

## 8.4. Session Layer
The container may manage several ads that are in different phases of their lifecycle; multiple concurrent sessions may be active. For example, while the container is rendering ad-A, it preloads and engages ad-B. Simultaneous two-way communication between the player and both ads persists.

Each session has a unique identifier. All messages that belong to a specific session must reference the same session id.

### 8.4.1 Establishing a New Session
SHARC delegates the session initialization to the container. The creative generates a unique session id and posts the first session message with the Message.type `createSession`. By posting the `createSession` message, the creative acknowledges its readiness to receive messages from the container.

#### Note: There is no expectation for the interactive creative component to be entirely able to participate in ad rendering at the time the creative signals `createSession` message. Full creative initialization may occur at later stages when the container provides complete data - see <link somewhere else> SHARC:Container:init.

Example of `createSession` Message data:
```
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 0,
    timestamp: 1564501643047,
    type: "createSession",
    args: { }
}
```
The creative must initialize the session as soon as possible. The container should establish a reasonable timeout for the session initialization message receipt.

The container responds to `createSession` with a `resolve` message.

<TODO Insert Diagram>

### 8.4.2. Session Establishing Delays and Failures

Typically, the container must wait for the creative to post a `createSession` message. However, SHARC recognizes that a container may have a specific timeout to ensure that the ad experience for a consumer is maintained. In this scenario, the container can unload the existing creative and load a new one, or provide an alternative behavior to preserve a good consumer experience. The series of events are as follows:
	
* The timeout expires.
* The `createSession` message does not arrive.
* The container unloads the creative.
* The container elects to collapse its view.
