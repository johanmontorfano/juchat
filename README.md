**Ju Chat is a P2P chat app, it ensures full privacy and data ownership.**

### Features

To make this a production grade chat app, some features needs to be included.
Among those, supplementary security features are needed to avoid being hacked
on a decentralized network with no authority.

- Messages with text and medias
- Pairing with anyone easily
- Rich-text chatting with reactions and deleting messages
- Cryptographic security to ensure integrity of pairs against spoofing
- Background service to always listen for incoming messages and notifications

### Roadmap

- [x] Pairing system
    - [x] Unsafe pairing
    - [x] Safe pairing with key-pairs for identity verification
- [x] Chatting
    - [x] Sending texts
    - [x] Rich-text messaging support
    - [x] Media sharing
    - [ ] Reactions
    - [ ] Deleting messages
    - [ ] ~Background service for notifications~
    > [!NOTE]
    > Due to the nature of the app, there is no way of enabling background
    > services able to uphold a WebRTC connection. Therefore, this is not
    > possible unless a native app is developped (with Electron or Tauri)
- [x] Profile
    - [x] Easy ID sharing through QR codes
    - [ ] Transfer/Clone profile on other devices for continuity

### Profile protection

Profile protection through identity verification ensures every pair of the
network that a user is still the same as the user they paired with. This does
not prevent someone from spoofing someone else identity, but it prevents
already existing chats from being spoofed by a evil someone.

Therefore profile protection will generate a public and private key pair when
initializing an identity, the public key will be shared to any peer that
connects to them, and each peer will be able to send challenges to connections
when opened to determine if the identity of someone has been spoofed.
