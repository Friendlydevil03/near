import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { QRData } from "@/types";
import { useStationStore } from "@/store/stationStore";
import { ScanBarcode, Camera, CameraOff, QrCode, RefreshCw } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useUserStore, hasRole } from "@/store/userStore";
import { Navigate } from "react-router-dom";

// Simple wrapper component for QR scanning
const QRScanner = ({
  onScan,
}: {
  onScan: (data: string) => void;
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("Ready to scan");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const scannerDivId = "qr-reader";
  const scannerContainerRef = useRef(null);

  // Ensure cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Load available cameras on component mount
  useEffect(() => {
    const loadCameras = async () => {
      try {
        // Request camera permission first
        await navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            // Stop the stream immediately after testing
            stream.getTracks().forEach(track => track.stop());
          });

        // Get cameras list
        const devices = await Html5Qrcode.getCameras();
        console.log("Available cameras:", devices);
        setAvailableCameras(devices);

        if (devices.length > 0) {
          // Look for back camera or set to first available
          const backCamera = devices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear')
          );
          setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
        }
      } catch (error) {
        console.error("Error accessing cameras:", error);
      }
    };

    loadCameras();
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setCameraMessage("Starting camera...");

    try {
      // Ensure we always have a fresh scanner div
      let qrDiv = document.getElementById(scannerDivId);
      if (qrDiv) {
        qrDiv.innerHTML = '';
      } else {
        // Create the div if it doesn't exist
        qrDiv = document.createElement('div');
        qrDiv.id = scannerDivId;
        qrDiv.style.width = '100%';
        qrDiv.style.height = '100%';

        // Use the ref to get the container
        const container = scannerContainerRef.current;
        if (!container) {
          throw new Error("Scanner container not found in DOM");
        }
        container.appendChild(qrDiv);
      }

      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize scanner
      try {
        scannerRef.current = new Html5Qrcode(scannerDivId);
        console.log("Scanner initialized");
      } catch (initErr) {
        console.error("Failed to initialize scanner:", initErr);
        throw new Error(`Scanner initialization failed: ${initErr.message}`);
      }

      // Configure scanning options - these are important for good scanning
      // Removed the problematic formatsToSupport option
      const config = {
        fps: 15,                      // Higher frame rate for better detection
        qrbox: { width: 300, height: 300 },  // Larger scanning area
        aspectRatio: 1.0,            // Square aspect ratio for scanning area
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true  // Use native detector if available
        }
      };

      setCameraMessage("Camera connecting...");

      // Try to use selected camera, fall back to automatic selection
      try {
        const cameraId = selectedCamera || { facingMode: "environment" };
        await scannerRef.current.start(
          cameraId,
          config,
          (decodedText) => {
            console.log("QR Code detected:", decodedText);
            handleQrCodeData(decodedText);
          },
          (errorMessage) => {
            // Don't show errors during scanning - they're normal
            console.log("QR error:", errorMessage);
          }
        );

        setCameraMessage("Scanning... Position QR code in view");
      } catch (cameraErr) {
        console.error("Error starting specific camera:", cameraErr);

        // Fall back to default camera as last resort
        try {
          await scannerRef.current.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              console.log("QR Code detected:", decodedText);
              handleQrCodeData(decodedText);
            },
            (errorMessage) => console.log("QR error:", errorMessage)
          );
          setCameraMessage("Scanning... Position QR code in view");
        } catch (fallbackErr) {
          throw new Error(`Camera access failed: ${fallbackErr.message}`);
        }
      }
    } catch (err) {
      console.error("Error in scanner setup:", err);
      setIsScanning(false);
      setCameraMessage("Camera error");

      toast({
        title: "Camera Error",
        description: `${err.message || err.toString()}. Try using HTTPS or check camera permissions.`,
        variant: "destructive",
      });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        console.log("Scanner stopped");
        setIsScanning(false);
        setCameraMessage("Ready to scan");
      }).catch(err => {
        console.error("Error stopping scanner:", err);
        setIsScanning(false);
        setCameraMessage("Ready to scan");
      });
    } else {
      setIsScanning(false);
      setCameraMessage("Ready to scan");
    }
  };

  const handleQrCodeData = (data: string) => {
    try {
      // First check if this might be a URL rather than direct JSON
      const qrContent = data;

      // If it looks like a URL, we might want to extract parameters or use as is
      if (data.startsWith('http')) {
        console.log("QR contains URL:", data);
        // For now, we'll just try it as-is, but you could extract params if needed
      }

      // Try to parse JSON
      JSON.parse(qrContent);

      // If it parses successfully, it's valid JSON
      stopScanner(); // Stop scanning
      onScan(qrContent); // Send data to parent

    } catch (err) {
      console.error("Invalid QR format:", err, data);
      // If it's not valid JSON, keep scanning but show a toast
      toast({
        title: "Invalid QR Code",
        description: "The QR code is not in the expected format.",
        variant: "destructive",
      });
      // Continue scanning - don't stop
    }
  };

  const handleSimulateScan = () => {
    // For testing only - create sample data
    const mockQrData: QRData = {
      userId: "user-001",
      walletId: "wallet-001",
      name: "Friendlydevil03",
      vehicle: {
        id: "vehicle-001",
        licensePlate: "ABC123",
        fuelType: "Regular"
      },
      timestamp: new Date().toISOString()
    };

    onScan(JSON.stringify(mockQrData));
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-fuel-blue-200">
        <CardContent className="p-6">
          <div className="flex justify-center mb-4">
            <div className="bg-fuel-blue-100 p-3 rounded-full">
              <ScanBarcode className="h-10 w-10 text-fuel-blue-500" />
            </div>
          </div>

          {isScanning ? (
            <div className="space-y-4">
              {/* Container for the scanner */}
              <div
                id="scanner-container-wrapper"
                ref={scannerContainerRef}
                className="relative h-80 bg-gray-100 border rounded-lg overflow-hidden"
              >
                {/* Message overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className="bg-white bg-opacity-70 px-4 py-2 rounded-md">
                    {cameraMessage}
                  </div>
                </div>

                {/* Scanning overlay with animation */}
                <div
                  className="absolute left-0 right-0 h-1 bg-fuel-blue-400 z-20 pointer-events-none"
                  style={{
                    animation: "scan-animation 2s infinite",
                    top: "50%"
                  }}
                ></div>

                {/* Animation keyframes */}
                <style>{`
                  @keyframes scan-animation {
                    0% { transform: translateY(-100px); }
                    50% { transform: translateY(100px); }
                    100% { transform: translateY(-100px); }
                  }
                `}</style>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  onClick={stopScanner}
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-600"
                >
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>

                <Button
                  onClick={() => {
                    stopScanner();
                    setTimeout(() => {
                      startScanner();
                    }, 500);
                  }}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <h3 className="text-lg font-medium">Scan Customer QR Code</h3>
              <p className="text-sm text-gray-500">
                Point your camera at the customer's QR code to complete the transaction
              </p>

              {/* Advanced Options Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-gray-500"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </Button>

              {/* Advanced Camera Selection */}
              {showAdvanced && availableCameras.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Camera:
                  </label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                  >
                    {availableCameras.map((camera) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label || `Camera ${camera.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mobile Access Warning */}
              {showAdvanced && (
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                  <p className="font-medium">For mobile access over local network:</p>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Use HTTPS for camera access</li>
                    <li>Run with: <code>HTTPS=true npm start</code></li>
                    <li>Or try tunneling with ngrok</li>
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button onClick={startScanner} className="bg-fuel-blue-500 hover:bg-fuel-blue-600">
                  <Camera className="h-4 w-4 mr-2" />
                  Start QR Scanner
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/scanner/manual-entry')}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </div>

              {/* For development testing only */}
              {process.env.NODE_ENV !== 'production' && (
                <Button
                  onClick={handleSimulateScan}
                  variant="ghost"
                  size="sm"
                  className="text-fuel-blue-600"
                >
                  Simulate Scan (Dev Only)
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting guide */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
        <h3 className="font-medium mb-1">Troubleshooting:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Mobile scanning over local network</strong> requires HTTPS - use "npm start -- --https" or access via ngrok</li>
          <li>Make sure QR code is <strong>well-lit</strong> and <strong>clearly visible</strong> - avoid glare and shadows</li>
          <li>Hold the QR code <strong>steady</strong> about 6-8 inches (15-20cm) from camera</li>
          <li>If scanning fails, try the "Restart Camera" button or switch cameras in advanced options</li>
          <li>For stubborn issues, use the Manual Entry option</li>
        </ul>
      </div>
    </div>
  );
};

// Main component remains the same
const ScanQR = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setScannedQrData } = useStationStore();
  const { currentUser } = useUserStore();

  // Check for attendant permissions
  if (currentUser && !hasRole(currentUser, ['admin', 'attendant'])) {
    return <Navigate to="/wallet" />;
  }

  const handleScan = async (data: string) => {
    try {
      const parsedData = JSON.parse(data);

      // Validate expected fields
      if (!parsedData.userId || !parsedData.walletId) {
        throw new Error("Invalid QR format - missing required fields");
      }

      // Ensure the name is properly set
      if (!parsedData.name) {
        parsedData.name = "Customer";
      }

      setScannedQrData(parsedData);

      toast({
        title: "QR Code Scanned",
        description: `Customer ${parsedData.name} identified`,
      });

      // Navigate to fuel selection and amount entry page
      navigate(`/scanner/select-fuel/${parsedData.userId}`);
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "The QR code could not be processed: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-fuel-blue-700">Scan Customer Code</h2>
        <Button
          variant="outline"
          onClick={() => navigate('/scanner/manual-entry')}
          className="flex items-center"
        >
          <QrCode className="h-4 w-4 mr-2" />
          Enter QR Manually
        </Button>
      </div>

      <QRScanner onScan={handleScan} />
    </div>
  );
};

export default ScanQR;
