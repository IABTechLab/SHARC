# DRAFT INSPRIATION FROM SIMID

# Messaging Protocol
In SHARC, the media player and the creative overlay communicate by exchanging asynchronous signals that maintain a custom messaging protocol. This protocol governs [8.1 Data Layer](#81-data-layer), [8.3 Transport Layer](8.3 Transport Layer), and [8.4 Session Layer](8.4 Session Layer).

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
A string that uniquely identifies the session to which Message belongs. See [8.4 Session Layer](8.4 Session Layer).

`messageId`
A message sequence number in the sender’s system. Each participant establishes its own independent sequence counter for the session. The first message `messageId` value is `0`. The sender increments each subsequent messageId value by `1`. In practice, this means that the creative and the player `messageId` values will be different based on the number of sent messages.

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
- Response messages - the signals the receiver transmits as acknowledgments of the primary message receipt and processing. There are two response Message types: [8.2.1 resolve Messages](8.2.1 resolve Messages) and [8.2.2 reject Messages](8.2.2 reject Messages).

Both primary and response messages implement the same data structure (see [8.1.1 Data Structure](8.1.1 Data Structure)).

### 8.2.1. resolve Messages
The receiver confirms successful message processing by replying with a resolution message.

`Message.type` must be resolve.

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
When the receiver is unable to process the message, it responds with rejection.

`Message.type` must be reject.

``Message.args.value` must be a `RejectMessageArgsValue` object:

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
Transport is a communication mechanism that can send serialized messages between two parties.

### 8.3.1. `postMessage` Transport
In HTML environments, where the player loads creative overlay in a cross-origin iframe, the parties utilize the standard `Window.postMessage()` API as the message transport mechanism.

### 8.3.2. Message Serialization
The message sender serializes data into a JSON string. The deserialized JSON must result in a clone of the original Message data object.

In JavaScript, `JSON.stringify()` performs serialization; `JSON.parse()` - deserialization.

## 8.4. Session Layer
The media player may manage several ads that are in different phases of their lifespans; multiple concurrent sessions may be active. For example, while the player is rendering ad-A, it preloads and engages ad-B. Simultaneous two-way communication between the player and both ads persists.

Each session has a unique identifier. All messages that belong to a specific session must reference the same session id.

### 8.4.1 Establishing a New Session
SHARC delegates the session initialization to the creative overlay. The creative generates a unique session id and posts the first session message with the Message.type createSession. By posting the createSession message, the creative acknowledges its readiness to receive messages from the player.

#### Note: There is no expectation for the interactive component to be entirely able to participate in ad rendering at the time the creative signals createSession message. Full creative initialization may occur at later stages when the player provides complete data - see <link somewhere else> SHARC:Player:init.

Example of createSession Message data:
```
{
    sessionId: "173378a4-b2e1-11e9-a2a3-2a2ae2dbcce4",
    messageId: 0,
    timestamp: 1564501643047,
    type: "createSession",
    args: { }
}
```
Creative should initialize the session as soon as possible. The player should establish a reasonable timeout for the session initialization message receipt.

The player responds to createSession with a resolve message.

<TODO Insert Diagram>

### 8.4.2. Session Establishing Delays and Failures

Typically, the player should wait for the creative to post a createSession message before proceeding to the simultaneous rendering of both ad media and the interactive component. However, SHARC recognizes scenarios when:

The creative fails to establish a session within the allotted time.
The player’s environment restricts timeout usage (effectively, the timeout is zero). Specifically, SSAI and live broadcasts force zero-timeout use cases.
The creative’s failure to establish a session does not prevent the player from rendering the ad media. If the creative does not post a createSession message on time, the player may proceed with the ad media rendering. However, the player allows the creative to recover in the middle of the ad media playback. The player:

Does not unload the creative.
Does not post messages to the creative.
Maintains the creativeSession message handler.
If the creative has not established a session before the media playback is complete, the player will report a VAST Error tracker with the proper error code. Examples of situations when this may occur are listed below.

Sequence for a failed session initialization

The timeout expires.
The createSession message does not arrive.
The player starts ad media.
The player reports the impression.
The ad media playback completes.
The player reports the VAST error tracker.
The player unloads the creative iframe.
Creative posts a createSession message after the timeout occurs

The timeout expires.
The player retains the interactive component.
The player initiates ad media playback.
The player reports the impression.
The player does not post messages to the creative.
The creative posts createSession message.
The player proceeds with the creative initialization.

