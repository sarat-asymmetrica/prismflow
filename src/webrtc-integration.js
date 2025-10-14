// PrismFlow Browser - WebRTC Integration
// Natural Asymmetry Video/Audio Communication

class WebRTCIntegration {
  constructor() {
    // Natural Asymmetry distribution for WebRTC
    this.PEER_CREATION = 0.3; // 30% - Connection establishment
    this.MEDIA_HANDLING = 0.2; // 20% - Audio/video processing
    this.UI_MANAGEMENT = 0.5; // 50% - User interface & controls

    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.isVideoEnabled = false;
    this.isAudioEnabled = false;

    // DOM cache for performance
    this.domCache = {};

    this.initializeWebRTC();
  }

  getCachedElement(key, selector) {
    if (!this.domCache[key]) {
      this.domCache[key] = document.querySelector(selector);
    }
    return this.domCache[key];
  }

  async initializeWebRTC() {
    // Check WebRTC support
    if (!this.isWebRTCSupported()) {
      console.log("WebRTC not supported in this browser");
      return;
    }

    console.log("🎥 WebRTC Integration initialized");
    this.createUI();
    this.setupPeerConnection();
  }

  isWebRTCSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.RTCPeerConnection
    );
  }

  createUI() {
    // Create WebRTC control panel
    const panel = document.createElement("div");
    panel.id = "webrtc-panel";
    panel.className = "webrtc-panel hidden";
    panel.innerHTML = `
            <div class="webrtc-header">
                <h3>📹 Video Call</h3>
                <button class="webrtc-close">×</button>
            </div>
            
            <div class="webrtc-videos">
                <div class="video-container local">
                    <video id="local-video" autoplay muted playsinline></video>
                    <div class="video-label">You</div>
                </div>
                <div class="video-container remote">
                    <video id="remote-video" autoplay playsinline></video>
                    <div class="video-label">Remote</div>
                </div>
            </div>
            
            <div class="webrtc-controls">
                <button id="start-camera" class="webrtc-btn camera">📷 Camera</button>
                <button id="start-audio" class="webrtc-btn audio">🎤 Mic</button>
                <button id="share-screen" class="webrtc-btn screen">🖥️ Screen</button>
                <button id="end-call" class="webrtc-btn end">📞 End</button>
            </div>
            
            <div class="webrtc-connection">
                <div class="connection-status">
                    <span id="connection-state">Disconnected</span>
                    <div class="connection-quality" id="connection-quality">
                        <div class="quality-bars">
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                        </div>
                    </div>
                </div>
                <div class="peer-controls">
                    <input type="text" id="peer-id" placeholder="Enter peer ID to connect">
                    <button id="connect-peer" class="webrtc-btn connect">Connect</button>
                </div>
            </div>
        `;

    document.body.appendChild(panel);
    this.setupEventHandlers();
    this.addWebRTCButton();
  }

  addWebRTCButton() {
    // Add WebRTC button to browser toolbar
    const toolbar = document.querySelector(".browser-toolbar");
    if (!toolbar) return;

    const webrtcBtn = document.createElement("button");
    webrtcBtn.className = "nav-btn";
    webrtcBtn.id = "webrtc-btn";
    webrtcBtn.title = "Video Call";
    webrtcBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 7l-7 5 7 5V7z"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
        `;

    webrtcBtn.addEventListener("click", () => this.togglePanel());

    // Insert before menu button
    const menuBtn = document.getElementById("menu-btn");
    toolbar.insertBefore(webrtcBtn, menuBtn);
  }

  setupEventHandlers() {
    const panel = this.getCachedElement("panel", "#webrtc-panel");

    // Panel controls
    panel.querySelector(".webrtc-close").addEventListener("click", () => {
      this.hidePanel();
    });

    // Media controls
    panel.querySelector("#start-camera").addEventListener("click", () => {
      this.toggleCamera();
    });

    panel.querySelector("#start-audio").addEventListener("click", () => {
      this.toggleAudio();
    });

    panel.querySelector("#share-screen").addEventListener("click", () => {
      this.shareScreen();
    });

    panel.querySelector("#end-call").addEventListener("click", () => {
      this.endCall();
    });

    // Connection controls
    panel.querySelector("#connect-peer").addEventListener("click", () => {
      const peerId = panel.querySelector("#peer-id").value.trim();
      if (peerId) {
        this.connectToPeer(peerId);
      }
    });
  }

  togglePanel() {
    const panel = this.getCachedElement("panel", "#webrtc-panel");
    panel.classList.toggle("hidden");

    if (!panel.classList.contains("hidden")) {
      // Auto-start camera when panel opens
      this.toggleCamera();
    }
  }

  hidePanel() {
    const panel = this.getCachedElement("panel", "#webrtc-panel");
    panel.classList.add("hidden");
    this.endCall();
  }

  setupPeerConnection() {
    // STUN servers for NAT traversal
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      const remoteVideo = document.getElementById("remote-video");
      if (remoteVideo && event.streams[0]) {
        remoteVideo.srcObject = event.streams[0];
        this.remoteStream = event.streams[0];
        console.log("🎥 Remote stream received");
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      this.updateConnectionStatus(state);
      console.log(`📡 Connection state: ${state}`);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real implementation, send this to the remote peer
        console.log("🧊 ICE candidate:", event.candidate);
      }
    };
  }

  async toggleCamera() {
    const cameraBtn = document.getElementById("start-camera");
    const localVideo = document.getElementById("local-video");

    if (!this.isVideoEnabled) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: this.isAudioEnabled,
        });

        localVideo.srcObject = this.localStream;
        this.isVideoEnabled = true;
        cameraBtn.classList.add("active");
        cameraBtn.textContent = "📷 Stop Camera";

        // Add tracks to peer connection
        if (this.peerConnection) {
          this.localStream.getTracks().forEach((track) => {
            this.peerConnection.addTrack(track, this.localStream);
          });
        }

        console.log("📷 Camera started");
      } catch (error) {
        console.error("Camera access denied:", error);
        alert(
          "Camera access denied. Please allow camera access to use video calls.",
        );
      }
    } else {
      // Stop camera
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((track) => {
          track.stop();
        });
      }
      localVideo.srcObject = null;
      this.isVideoEnabled = false;
      cameraBtn.classList.remove("active");
      cameraBtn.textContent = "📷 Camera";
      console.log("📷 Camera stopped");
    }
  }

  async toggleAudio() {
    const audioBtn = document.getElementById("start-audio");

    if (!this.isAudioEnabled) {
      try {
        if (!this.localStream) {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: this.isVideoEnabled,
          });
        }

        this.isAudioEnabled = true;
        audioBtn.classList.add("active");
        audioBtn.textContent = "🎤 Mute";
        console.log("🎤 Audio started");
      } catch (error) {
        console.error("Microphone access denied:", error);
        alert(
          "Microphone access denied. Please allow microphone access for audio calls.",
        );
      }
    } else {
      // Mute audio
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      this.isAudioEnabled = false;
      audioBtn.classList.remove("active");
      audioBtn.textContent = "🎤 Mic";
      console.log("🎤 Audio muted");
    }
  }

  async shareScreen() {
    const screenBtn = document.getElementById("share-screen");
    const localVideo = document.getElementById("local-video");

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });

      localVideo.srcObject = screenStream;
      screenBtn.classList.add("active");
      screenBtn.textContent = "🖥️ Stop Share";

      // Replace video track in peer connection
      if (this.peerConnection && this.localStream) {
        const sender = this.peerConnection
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          await sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      }

      console.log("🖥️ Screen sharing started");

      // Handle screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        screenBtn.classList.remove("active");
        screenBtn.textContent = "🖥️ Screen";
        this.toggleCamera(); // Return to camera
      };
    } catch (error) {
      console.error("Screen sharing failed:", error);
    }
  }

  updateConnectionStatus(state) {
    const statusEl = document.getElementById("connection-state");
    const qualityEl = document.getElementById("connection-quality");

    if (statusEl) {
      statusEl.textContent = state.charAt(0).toUpperCase() + state.slice(1);
      statusEl.className = `status-${state}`;
    }

    // Update quality bars based on connection state
    if (qualityEl) {
      const bars = qualityEl.querySelectorAll(".bar");
      bars.forEach((bar) => bar.classList.remove("active"));

      switch (state) {
        case "connected":
          bars.forEach((bar) => bar.classList.add("active"));
          break;
        case "connecting":
          bars[0].classList.add("active");
          break;
        case "failed":
        case "disconnected":
          // No active bars
          break;
      }
    }
  }

  async connectToPeer(peerId) {
    console.log(`🔗 Attempting to connect to peer: ${peerId}`);

    // In a real implementation, this would:
    // 1. Connect to signaling server
    // 2. Exchange offer/answer with peer
    // 3. Exchange ICE candidates

    // For demo purposes, simulate connection
    setTimeout(() => {
      this.updateConnectionStatus("connecting");
      setTimeout(() => {
        this.updateConnectionStatus("connected");
      }, 2000);
    }, 500);
  }

  endCall() {
    // Stop all media streams
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.setupPeerConnection(); // Recreate for next call
    }

    // Reset UI
    const localVideo = document.getElementById("local-video");
    const remoteVideo = document.getElementById("remote-video");

    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;

    // Reset button states
    document.querySelectorAll(".webrtc-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.getElementById("start-camera").textContent = "📷 Camera";
    document.getElementById("start-audio").textContent = "🎤 Mic";
    document.getElementById("share-screen").textContent = "🖥️ Screen";

    this.isVideoEnabled = false;
    this.isAudioEnabled = false;

    this.updateConnectionStatus("disconnected");
    console.log("📞 Call ended");
  }
}

// Add styles for WebRTC UI
const webrtcStyles = `
<style>
.webrtc-panel {
    position: fixed;
    right: 20px;
    top: 80px;
    width: 450px;
    background: rgba(20, 20, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    z-index: 9999;
    color: #fff;
    transition: all 0.3s ease;
    max-height: 80vh;
    overflow-y: auto;
}

.webrtc-panel.hidden {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-20px);
}

.webrtc-header {
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.webrtc-header h3 {
    margin: 0;
    color: #4ade80;
}

.webrtc-close {
    background: none;
    border: none;
    color: #999;
    font-size: 1.5em;
    cursor: pointer;
}

.webrtc-videos {
    display: flex;
    gap: 10px;
    padding: 15px;
}

.video-container {
    flex: 1;
    position: relative;
    background: #000;
    border-radius: 10px;
    overflow: hidden;
}

.video-container video {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 10px;
}

.video-label {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.7);
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 0.8em;
}

.webrtc-controls {
    display: flex;
    gap: 10px;
    padding: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.webrtc-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.3s ease;
    min-width: 90px;
}

.webrtc-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.webrtc-btn.active {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    border-color: #4ade80;
}

.webrtc-btn.end {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: #ef4444;
}

.webrtc-connection {
    padding: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.connection-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.connection-quality {
    display: flex;
    align-items: center;
}

.quality-bars {
    display: flex;
    gap: 2px;
}

.bar {
    width: 4px;
    height: 12px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
}

.bar.active {
    background: #4ade80;
}

.peer-controls {
    display: flex;
    gap: 10px;
}

#peer-id {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
}

#peer-id::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.webrtc-btn.connect {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-color: #3b82f6;
}

.status-connected {
    color: #4ade80;
}

.status-connecting {
    color: #fbbf24;
}

.status-disconnected {
    color: #ef4444;
}

#webrtc-btn {
    color: #4ade80;
}

#webrtc-btn:hover {
    background: rgba(74, 222, 128, 0.1);
}
</style>
`;

// Initialize WebRTC integration
document.addEventListener("DOMContentLoaded", () => {
  // Add styles
  document.head.insertAdjacentHTML("beforeend", webrtcStyles);

  // Initialize WebRTC
  window.webrtcIntegration = new WebRTCIntegration();

  console.log("🎥 WebRTC Integration ready - Natural Asymmetry powered!");
});

// Export for Node.js if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = WebRTCIntegration;
}
