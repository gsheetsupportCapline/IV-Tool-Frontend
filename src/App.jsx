import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import Body from "./components/Body";
import "./App.css";

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Body />
    </LocalizationProvider>
  );
};

export default App;
