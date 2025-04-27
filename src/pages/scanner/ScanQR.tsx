import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { QRData } from "@/types";
import { useStationStore } from "@/store/stationStore";
import { ScanBarcode, Camera, CameraOff, QrCode } from "lucide-react";
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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const scannerDivId = "qr-reader";

  // Ensure cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Check for camera permissions explicitly
  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately after testing
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Camera permission error:", error);
      return false;
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setCameraMessage("Starting camera...");

    try {
      // First check if camera permissions are available
      const hasPermission = await checkCameraPermission();
      if (!hasPermission) {
        throw new Error("Camera permission denied");
      }

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

        // Find container and append
        const container = document.getElementById('scanner-container-wrapper');
        if (!container) {
          throw new Error("Scanner container not found in DOM");
        }
        container.appendChild(qrDiv);
      }

      // Wait a moment for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize scanner with error handling
      try {
        scannerRef.current = new Html5Qrcode(scannerDivId);
        console.log("Scanner initialized");
      } catch (err) {
        console.error("Scanner initialization error:", err);
        throw new Error("Failed to initialize scanner");
      }

      // Get available cameras
      let devices = [];
      try {
        devices = await Html5Qrcode.getCameras();
        console.log("Available cameras:", devices);
      } catch (err) {
        console.warn("Error getting camera list:", err);
        // Continue with default camera
      }

      // Select appropriate camera
      if (devices && devices.length > 0) {
        // Look specifically for back camera
        const backCameraKeywords = ['back', 'rear', 'environment'];
        let selectedCamera = devices[0].id;

        // Try to find back camera
        for (const device of devices) {
          const deviceNameLower = device.label.toLowerCase();
          if (backCameraKeywords.some(keyword => deviceNameLower.includes(keyword))) {
            selectedCamera = device.id;
            break;
          }
        }

        // If multiple cameras and first wasn't explicitly recognized as back, try the second
        if (devices.length > 1 && selectedCamera === devices[0].id) {
          selectedCamera = devices[1].id;
        }

        setCameraMessage("Camera connecting...");

        try {
          await scannerRef.current.start(
            selectedCamera,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              console.log("QR Code detected:", decodedText);
              handleQrCodeData(decodedText);
            },
            (errorMessage) => {
              // Don't show errors during scanning - they're normal
              console.log("QR error:", errorMessage);
            }
          );
          setCameraMessage("Scanning for QR code...");
          return;
        } catch (err) {
          console.error("Error starting camera with ID:", err);
          // Fall through to default method
        }
      }

      // Fallback to default camera
      setCameraMessage("Using default camera...");

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          handleQrCodeData(decodedText);
        },
        (errorMessage) => {
          // Don't show errors during scanning - they're normal
          console.log("QR error:", errorMessage);
        }
      );

      setCameraMessage("Scanning for QR code...");
    } catch (err) {
      console.error("Error starting camera:", err);
      setIsScanning(false);
      setCameraMessage("Camera error");

      toast({
        title: "Camera Error",
        description: `Could not access camera: ${err.message || err.toString()}. Please try manual entry instead.`,
        variant: "destructive",
      });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        console.log("Scanner stopped");
        setIsScanning(false);
        setCameraMessage("Ready to scan");
      }).catch(err => {
        console.error("Error stopping scanner:", err);
        // Force state update even if stop fails
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
      // Try to parse JSON
      JSON.parse(data);

      // If it parses, it's valid JSON
      stopScanner(); // Stop scanning
      onScan(data); // Send data to parent
    } catch (err) {
      // If it's not valid JSON, keep scanning but show a toast
      toast({
        title: "Invalid QR Code",
        description: "The QR code is not in a valid format",
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
              {/* Container for the scanner - using ID rather than ref */}
              <div
                id="scanner-container-wrapper"
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

                {/* Scanner div will be inserted here */}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={stopScanner}
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-600"
                >
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <h3 className="text-lg font-medium">Scan Customer QR Code</h3>
              <p className="text-sm text-gray-500">
                Point your camera at the customer's QR code to complete the transaction
              </p>

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

      {/* Browser compatibility alert */}
      <div className="text-xs text-gray-500 text-center">
        QR scanning works best on Chrome, Safari, and Edge on most mobile devices.
        <br />If you encounter issues, please try the Manual Entry option.
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

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
        <h3 className="font-medium mb-1">Scanning Tips:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Make sure the QR code is well-lit and clearly visible</li>
          <li>Hold the device steady and position the QR code in the center</li>
          <li>If scanning fails, try the Manual Entry option</li>
          <li>Allow camera permissions when prompted by your browser</li>
          <li>For local development, use the "Simulate Scan" or Manual Entry options</li>
        </ul>
      </div>
    </div>
  );
};

export default ScanQR;