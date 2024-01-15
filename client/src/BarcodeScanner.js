import { Box, Card, CardMedia } from "@mui/material";
import { useZxing } from "react-zxing";

export default function BarcodeScanner(props) {
  const { ref } = useZxing({
    onResult(result) {
      props.setResult(result.getText());
    },
  });

  return (
    <Card>
        <CardMedia
            component="video"
            alt="Cannot Access Camera"
            height="140"
            ref={ref}
        />
    </Card>
  );
};