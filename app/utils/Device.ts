import { Dimensions, ScaledSize } from "react-native";

export class DeviceClass {
  constructor(private size: ScaledSize) {}

  public get SM() {
    return this.size.width > 576;
  }
  public get MD() {
    return this.size.width > 768;
  }
  public get LG() {
    return this.size.width > 992;
  }
  public get XL() {
    return this.size.width > 1200;
  }
  public get XXL() {
    return this.size.width > 1400;
  }
}

const Device = new DeviceClass(Dimensions.get("window"));
export default Device;
