# payment.fiat2defi.ch

## Deployment
* npx expo-optimize
* expo build:web
* Copy content of web-build folder to web server

## Open Points
* Enable mobile apps
    * Activate deep linking (for URL based routing): https://reactnavigation.org/docs/deep-linking/
    * User SafeAreaView
* Add linting
* Use redux?

## Tracking changes in files migrated from [Wallet](https://github.com/DFXswiss/wallet)

This repository contains files that have been copied over from [Wallet](https://github.com/DFXswiss/wallet) and must be kept in sync. If you import such a file, then specify its path in [`wallet-filemap.txt`](wallet-filemap.txt). Then run [`wallet-diff.sh`](wallet-diff.sh) to display the changes. Apply the necessary upstream patches as needed.

### Example

```
$ ./wallet-diff.sh ../wallet/
--- ../wallet//mobile-app/app/api/index.ts	2021-11-03 18:42:57.994173762 +0100
+++ app/api/index.ts	2021-11-09 08:49:18.200239947 +0100
@@ -1,6 +1,6 @@
-export * from './secured'
+// export * from './secured'
 export * from './logging'
 export { ThemePersistence } from './persistence/theme_storage'
-export { LanguagePersistence } from './persistence/language_storage'
-export { DisplayDexGuidelinesPersistence } from './persistence/display_dexguidelines_storage'
-export { DisplayBalancesPersistence } from './persistence/display_balances_storage'
+// export { LanguagePersistence } from './persistence/language_storage'
+// export { DisplayDexGuidelinesPersistence } from './persistence/display_dexguidelines_storage'
+// export { DisplayBalancesPersistence } from './persistence/display_balances_storage'
Comparing: app/api/index.ts
Comparing: app/api/logging.ts
Comparing: app/api/persistence/theme_storage.ts
--- ../wallet//mobile-app/app/components/Text.tsx	2021-11-03 18:42:57.998173787 +0100
+++ app/components/Text.tsx	2021-11-09 08:49:18.216240043 +0100
@@ -1,6 +1,6 @@
 import React from 'react'
 import { Text as DefaultText } from 'react-native'
-import { tailwind } from '@tailwind'
+import { tailwind } from '../tailwind'

 export const HeaderFont = tailwind('font-semibold')

Comparing: app/components/Text.tsx
--- ../wallet//mobile-app/app/components/index.tsx	2021-11-03 18:42:58.002173811 +0100
+++ app/components/index.tsx	2021-11-09 08:49:18.224240090 +0100
@@ -1,6 +1,6 @@
 import React from 'react'
 import { Switch as DefaultSwitch, TextInput as DefaultTextInput, View as DefaultView } from 'react-native'
-import { tailwind } from '@tailwind'
+import { tailwind } from '../tailwind'

 export function View (props: DefaultView['props']): JSX.Element {
   const { style, ...otherProps } = props
Comparing: app/components/index.tsx
Comparing: app/components/icons/AppIcon.test.tsx
Comparing: app/components/icons/AppIcon.tsx
Comparing: app/components/icons/assets/BTC.tsx
Comparing: app/components/icons/assets/dBCH.tsx
Comparing: app/components/icons/assets/dBTC.tsx
Comparing: app/components/icons/assets/dDFI.tsx
Comparing: app/components/icons/assets/dDOGE.tsx
Comparing: app/components/icons/assets/_Default.tsx
Comparing: app/components/icons/assets/dETH.tsx
Comparing: app/components/icons/assets/DFI.tsx
Comparing: app/components/icons/assets/dLTC.tsx
Comparing: app/components/icons/assets/dUSDC.tsx
Comparing: app/components/icons/assets/dUSDT.tsx
Comparing: app/components/icons/assets/index.test.tsx
Comparing: app/components/icons/assets/index.ts
Comparing: app/components/themed/index.tsx
Comparing: app/components/themed/SectionTitle.tsx
File does not exist: ../wallet//mobile-app/app/components/themed/test-themed.txt
Comparing: app/components/themed/ThemedActivityIndicator.tsx
Comparing: app/components/themed/ThemedFlatList.tsx
--- ../wallet//mobile-app/app/components/themed/ThemedIcon.tsx	2021-11-03 18:42:58.002173811 +0100
+++ app/components/themed/ThemedIcon.tsx	2021-11-13 10:27:51.301608952 +0100
@@ -1,4 +1,5 @@
 import { useThemeContext } from '@contexts/ThemeProvider'
+xxx
 import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
 import { IconProps } from '@expo/vector-icons/build/createIconSet'
 import { tailwind } from '@tailwind'
Comparing: app/components/themed/ThemedIcon.tsx
Comparing: app/components/themed/ThemedScrollView.tsx
Comparing: app/components/themed/ThemedSectionList.tsx
Comparing: app/components/themed/ThemedSectionTitle.tsx
Comparing: app/components/themed/ThemedTextInput.test.tsx
Comparing: app/components/themed/ThemedTextInput.tsx
Comparing: app/components/themed/ThemedText.tsx
Comparing: app/components/themed/ThemedTouchableOpacity.tsx
Comparing: app/components/themed/ThemedView.tsx
Compared 33 file pairs.
1 corresponding wallet files were missing.
Skipped 11 backup files.
```

You can use `>1` or `>2` standard output/error stream redirection to filter the necessary information. For example:

```
$ ./wallet-diff.sh ../wallet/ 1>/dev/null
Comparing: app/api/index.ts
Comparing: app/api/logging.ts
Comparing: app/api/persistence/theme_storage.ts
Comparing: app/components/Text.tsx
Comparing: app/components/index.tsx
Comparing: app/components/icons/AppIcon.test.tsx
Comparing: app/components/icons/AppIcon.tsx
Comparing: app/components/icons/assets/BTC.tsx
Comparing: app/components/icons/assets/dBCH.tsx
Comparing: app/components/icons/assets/dBTC.tsx
Comparing: app/components/icons/assets/dDFI.tsx
Comparing: app/components/icons/assets/dDOGE.tsx
Comparing: app/components/icons/assets/_Default.tsx
Comparing: app/components/icons/assets/dETH.tsx
Comparing: app/components/icons/assets/DFI.tsx
Comparing: app/components/icons/assets/dLTC.tsx
Comparing: app/components/icons/assets/dUSDC.tsx
Comparing: app/components/icons/assets/dUSDT.tsx
Comparing: app/components/icons/assets/index.test.tsx
Comparing: app/components/icons/assets/index.ts
Comparing: app/components/themed/index.tsx
Comparing: app/components/themed/SectionTitle.tsx
File does not exist: ../wallet//mobile-app/app/components/themed/test-themed.txt
Comparing: app/components/themed/ThemedActivityIndicator.tsx
Comparing: app/components/themed/ThemedFlatList.tsx
Comparing: app/components/themed/ThemedIcon.tsx
Comparing: app/components/themed/ThemedScrollView.tsx
Comparing: app/components/themed/ThemedSectionList.tsx
Comparing: app/components/themed/ThemedSectionTitle.tsx
Comparing: app/components/themed/ThemedTextInput.test.tsx
Comparing: app/components/themed/ThemedTextInput.tsx
Comparing: app/components/themed/ThemedText.tsx
Comparing: app/components/themed/ThemedTouchableOpacity.tsx
Comparing: app/components/themed/ThemedView.tsx
Compared 33 file pairs.
1 corresponding wallet files were missing.
Skipped 11 backup files.
```
