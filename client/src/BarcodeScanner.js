import { Box, Card, CardMedia } from "@mui/material";
import { useEffect, useState } from "react";
import {
  BrowserMultiFormatReader,
  NotFoundException,
  DecodeHintType,
  BarcodeFormat
} from "@zxing/library";

export default function BarcodeScanner(props) {
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [videoInputDevices, setVideoInputDevices] = useState([]);
  const hints = new Map();
  const formats = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.UPC_EAN_EXTENSION,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8
  ];
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true);
  const codeReader = new BrowserMultiFormatReader();
  var sourceSelect;

  console.log("ZXing code reader initialized");

  useEffect(() => {
    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        setupDevices(videoInputDevices);
      })
      .catch((err) => {
        if (err && !(err instanceof NotFoundException)) {
          console.error(err);
        }
      });
  }, []);

  function setupDevices(videoInputDevices) {
    sourceSelect = document.getElementById("sourceSelect");

    // selects first device
    setSelectedDeviceId(videoInputDevices[0].deviceId);

    // setup devices dropdown
    if (videoInputDevices.length >= 1) {
      setVideoInputDevices(videoInputDevices);
    }
  }

  function resetClick() {
    codeReader.reset();
    console.log("Reset.");
  }

  function decodeContinuously(selectedDeviceId) {
    codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      "video",
      (result, err) => {
        if (result) {
          // properly decoded code
          console.log("Found code!", result);
          props.setResult(result.text);
          resetClick();
        }

        if (err && !(err instanceof NotFoundException)) {
          console.error(err);
        }
      }
    );
  }

  useEffect(() => {
    if (props.productCode) {
      resetClick();
    } else {
      decodeContinuously(selectedDeviceId);
      console.log(`Started decode from camera with id ${selectedDeviceId}`);
    }
  }, [props.productCode]);

  return (
    <Card>
        <CardMedia
            id="video"
            component="video"
            alt="Cannot Access Camera"
        >
          <video id="video" width="100%" height="720px" />
        </CardMedia>
        <select
          id="sourceSelect"
          onChange={() => setSelectedDeviceId(sourceSelect.value)}
        >
          {videoInputDevices.map((element) => (
            <option value={element.deviceId}>{element.label}</option>
          ))}
        </select>
    </Card>
  );
};