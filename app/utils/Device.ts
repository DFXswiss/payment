import { Dimensions } from "react-native";

// TODO: create a hook?

class DeviceClass {
  public get SM() {
    return Dimensions.get("window").width > 576;
  }
  public get MD() {
    return Dimensions.get("window").width > 768;
  }
  public get LG() {
    return Dimensions.get("window").width > 992;
  }
  public get XL() {
    return Dimensions.get("window").width > 1200;
  }
  public get XXL() {
    return Dimensions.get("window").width > 1400;
  }
}

const Device = new DeviceClass();
export default Device;
