'use client';

import React, { useRef, useEffect, useState } from 'react';

const DriveXS = ({ showSettings, onSettingsToggle, isMuted, onMuteToggle }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("INITIALIZING SYSTEM...");
  
  const [settings, setSettings] = useState({
    resolution: '1024x768',
    lanes: 3,
    roadWidth: 2000,
    cameraHeight: 1000,
    drawDistance: 300,
    fieldOfView: 100,
    fogDensity: 5
  });

  // Loading Sequence
  useEffect(() => {
    const sequence = [
      { text: "INITIALIZING SYSTEM...", delay: 800 },
      { text: "CHECKING OIL PRESSURE...", delay: 800 },
      { text: "CALIBRATING ENGINE...", delay: 800 },
      { text: "LOADING TRACK DATA...", delay: 800 },
      { text: "READY TO RACE", delay: 1000 }
    ];

    let currentIndex = 0;

    const runSequence = () => {
      if (currentIndex < sequence.length) {
        setLoadingText(sequence[currentIndex].text);
        setTimeout(() => {
          currentIndex++;
          if (currentIndex === sequence.length) {
            setIsLoading(false);
          } else {
            runSequence();
          }
        }, sequence[currentIndex].delay);
      }
    };

    runSequence();
  }, []);

  useEffect(() => {
    // Auto-focus iframe when it loads
    const handleIframeLoad = () => {
      if (iframeRef.current) {
        iframeRef.current.focus();
        if (iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.focus();
        }
      }
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
      // Also focus immediately if already loaded
      setTimeout(handleIframeLoad, 100);
    }

    // Function to send key events to iframe
    const sendKeyToIframe = (key, type) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const event = new KeyboardEvent(type, {
          key: key,
          code: key === 'ArrowUp' ? 'ArrowUp' :
                key === 'ArrowDown' ? 'ArrowDown' :
                key === 'ArrowLeft' ? 'ArrowLeft' :
                key === 'ArrowRight' ? 'ArrowRight' :
                key === 'KeyW' ? 'KeyW' :
                key === 'KeyS' ? 'KeyS' :
                key === 'KeyA' ? 'KeyA' :
                key === 'KeyD' ? 'KeyD' : key,
          keyCode: key === 'ArrowUp' ? 38 :
                   key === 'ArrowDown' ? 40 :
                   key === 'ArrowLeft' ? 37 :
                   key === 'ArrowRight' ? 39 :
                   key === 'KeyW' ? 87 :
                   key === 'KeyS' ? 83 :
                   key === 'KeyA' ? 65 :
                   key === 'KeyD' ? 68 : 0,
          which: key === 'ArrowUp' ? 38 :
                 key === 'ArrowDown' ? 40 :
                 key === 'ArrowLeft' ? 37 :
                 key === 'ArrowRight' ? 39 :
                 key === 'KeyW' ? 87 :
                 key === 'KeyS' ? 83 :
                 key === 'KeyA' ? 65 :
                 key === 'KeyD' ? 68 : 0,
          bubbles: true,
          cancelable: true
        });
        iframeRef.current.contentWindow.document.dispatchEvent(event);
      }
    };

    // Expose controls to window for button clicks
    window.driveXSControls = {
      startAccelerate: () => sendKeyToIframe('ArrowUp', 'keydown'),
      stopAccelerate: () => sendKeyToIframe('ArrowUp', 'keyup'),
      startBrake: () => sendKeyToIframe('ArrowDown', 'keydown'),
      stopBrake: () => sendKeyToIframe('ArrowDown', 'keyup'),
      startTurnLeft: () => sendKeyToIframe('ArrowLeft', 'keydown'),
      stopTurnLeft: () => sendKeyToIframe('ArrowLeft', 'keyup'),
      startTurnRight: () => sendKeyToIframe('ArrowRight', 'keydown'),
      stopTurnRight: () => sendKeyToIframe('ArrowRight', 'keyup'),
      toggleMute: () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const music = iframeRef.current.contentWindow.document.getElementById('music');
          if (music) {
            music.muted = !music.muted;
          }
        }
      }
    };

    return () => {
      delete window.driveXSControls;
    };
  }, []);

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    
    if (iframeRef.current && iframeRef.current.contentWindow && iframeRef.current.contentWindow.driveXSSettings) {
      switch (setting) {
        case 'resolution':
          const [w, h] = value.split('x').map(Number);
          iframeRef.current.contentWindow.driveXSSettings.setResolution(w, h);
          break;
        case 'lanes':
          iframeRef.current.contentWindow.driveXSSettings.setLanes(parseInt(value));
          break;
        case 'roadWidth':
          iframeRef.current.contentWindow.driveXSSettings.setRoadWidth(parseInt(value));
          break;
        case 'cameraHeight':
          iframeRef.current.contentWindow.driveXSSettings.setCameraHeight(parseInt(value));
          break;
        case 'drawDistance':
          iframeRef.current.contentWindow.driveXSSettings.setDrawDistance(parseInt(value));
          break;
        case 'fieldOfView':
          iframeRef.current.contentWindow.driveXSSettings.setFieldOfView(parseInt(value));
          break;
        case 'fogDensity':
          iframeRef.current.contentWindow.driveXSSettings.setFogDensity(parseInt(value));
          break;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[60vh]" style={{
        backgroundColor: '#000',
        color: '#0f0',
        fontFamily: '"Press Start 2P", monospace',
        textAlign: 'center',
        border: '2px solid #0f0'
      }}>
        <h1 style={{
          color: '#ff00ff',
          textShadow: '4px 4px 0 #00ffff',
          marginBottom: '20px',
          fontSize: '32px',
          lineHeight: '1.2'
        }}>DRIVE XS</h1>
        
        <div className="w-64 h-2 bg-gray-800 rounded mb-8 overflow-hidden border border-green-500">
          <div className="h-full bg-green-500 animate-pulse" style={{ width: '100%' }}></div>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#0f0',
          marginBottom: '40px',
          letterSpacing: '2px'
        }}>{loadingText}</p>

        <div style={{
          fontSize: '10px',
          color: '#00ffff',
          animation: 'blinker 0.8s step-end infinite'
        }}>SYSTEM BOOTING...</div>

        <style jsx>{`
          @keyframes blinker {
            50% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center relative">
      {/* Game Container */}
      <div className="relative w-full max-w-[90vw] aspect-[4/3] border border-green-500 bg-black overflow-hidden">
        <iframe
          ref={iframeRef}
          src="drivexs/index.html"
          className="w-full h-full border-none"
          style={{
            backgroundColor: 'black'
          }}
          title="DriveXS Racing Game"
          allow="autoplay"
          tabIndex="0"
          onLoad={() => {
            if (iframeRef.current) {
              iframeRef.current.focus();
            }
          }}
        />
      </div>

      {/* Mobile Controls - Split Layout */}
      <div className="flex justify-between items-center w-full max-w-md mt-4 px-4">
        {/* Left Side - Acceleration/Braking */}
        <div className="flex flex-col gap-2">
          <button
            className="w-16 h-16 bg-green-900/50 border-2 border-green-500 rounded-full flex items-center justify-center text-green-400 active:bg-green-700 select-none font-bold text-xl shadow-lg"
            onPointerDown={(e) => {
              e.preventDefault();
              if(window.driveXSControls) window.driveXSControls.startAccelerate();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              if(window.driveXSControls) window.driveXSControls.stopAccelerate();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              if(window.driveXSControls) window.driveXSControls.stopAccelerate();
            }}
          >
            ▲
          </button>
          <div className="text-green-600 text-xs font-mono text-center">GAS</div>
          <button
            className="w-16 h-16 bg-green-900/50 border-2 border-green-500 rounded-full flex items-center justify-center text-green-400 active:bg-green-700 select-none font-bold text-xl shadow-lg"
            onPointerDown={(e) => {
              e.preventDefault();
              if(window.driveXSControls) window.driveXSControls.startBrake();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              if(window.driveXSControls) window.driveXSControls.stopBrake();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              if(window.driveXSControls) window.driveXSControls.stopBrake();
            }}
          >
            ▼
          </button>
          <div className="text-green-600 text-xs font-mono text-center">BRAKE</div>
        </div>

        {/* Right Side - Steering */}
        <div className="flex gap-2">
          <div className="flex flex-col items-center">
            <button
              className="w-16 h-16 bg-green-900/50 border-2 border-green-500 rounded-full flex items-center justify-center text-green-400 active:bg-green-700 select-none font-bold text-xl shadow-lg"
              onPointerDown={(e) => {
                e.preventDefault();
                if(window.driveXSControls) window.driveXSControls.startTurnLeft();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                if(window.driveXSControls) window.driveXSControls.stopTurnLeft();
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                if(window.driveXSControls) window.driveXSControls.stopTurnLeft();
              }}
            >
              ◀
            </button>
            <div className="text-green-600 text-xs font-mono text-center mt-1">LEFT</div>
          </div>
          <div className="flex flex-col items-center">
            <button
              className="w-16 h-16 bg-green-900/50 border-2 border-green-500 rounded-full flex items-center justify-center text-green-400 active:bg-green-700 select-none font-bold text-xl shadow-lg"
              onPointerDown={(e) => {
                e.preventDefault();
                if(window.driveXSControls) window.driveXSControls.startTurnRight();
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                if(window.driveXSControls) window.driveXSControls.stopTurnRight();
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                if(window.driveXSControls) window.driveXSControls.stopTurnRight();
              }}
            >
              ▶
            </button>
            <div className="text-green-600 text-xs font-mono text-center mt-1">RIGHT</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-green-600 text-sm font-mono text-center">
        Keyboard: Arrow Keys or WASD • Touch: Use Onscreen controls
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-green-500 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-400 font-mono text-lg font-bold">DRIVEXS SETTINGS</h3>
              <button
                onClick={onSettingsToggle}
                className="text-green-500 hover:text-green-300 px-2 py-1 rounded font-mono"
              >
                [X]
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">Resolution:</label>
                <select
                  value={settings.resolution}
                  onChange={(e) => handleSettingChange('resolution', e.target.value)}
                  className="w-full bg-black border border-green-500 text-green-400 font-mono p-2 rounded"
                >
                  <option value="1280x960">Fine (1280x960)</option>
                  <option value="1024x768">High (1024x768)</option>
                  <option value="640x480">Medium (640x480)</option>
                  <option value="480x360">Low (480x360)</option>
                </select>
              </div>

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">Lanes:</label>
                <select
                  value={settings.lanes}
                  onChange={(e) => handleSettingChange('lanes', e.target.value)}
                  className="w-full bg-black border border-green-500 text-green-400 font-mono p-2 rounded"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">
                  Road Width: {settings.roadWidth}
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  value={settings.roadWidth}
                  onChange={(e) => handleSettingChange('roadWidth', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">
                  Camera Height: {settings.cameraHeight}
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  value={settings.cameraHeight}
                  onChange={(e) => handleSettingChange('cameraHeight', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">
                  Draw Distance: {settings.drawDistance}
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={settings.drawDistance}
                  onChange={(e) => handleSettingChange('drawDistance', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">
                  Field of View: {settings.fieldOfView}
                </label>
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={settings.fieldOfView}
                  onChange={(e) => handleSettingChange('fieldOfView', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono text-sm mb-2">
                  Fog Density: {settings.fogDensity}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.fogDensity}
                  onChange={(e) => handleSettingChange('fogDensity', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveXS;