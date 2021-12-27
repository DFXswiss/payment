import Clipboard from "expo-clipboard";
import i18n from "../i18n/i18n";
import NotificationService from "./NotificationService";

class ClipboardServiceClass {
  public copy(text: string): void {
    Clipboard.setString(text);
    NotificationService.success(i18n.t("feedback.copied"));
  }
}

const ClipboardService = new ClipboardServiceClass();
export default ClipboardService;
