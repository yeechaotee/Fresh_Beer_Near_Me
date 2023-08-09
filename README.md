# Fresh_Beer_Near_Me

# Expo Router Example

Use [`expo-router`](https://expo.github.io/router) to build native navigation using files in the `app/` directory.

## 🚀 How to use

```sh
npm install --global expo-cli
expo-cli start --tunnel
```

## 🚀 Additional CLI Installation required for react-navigation:

```sh
npm install @react-navigation/stack
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install @react-navigation/material-bottom-tabs react-native-paper react-native-vector-icons
npm install @react-navigation/material-top-tabs react-native-tab-view
npm install react-native-gesture-handler
npm install react-native-bouncy-checkbox
npm install tslib
npm install react-redux
npm install lottie-react-native  (for animation icon on page, as json file)
```

## 📝 Discovery Module required CLI installation:

```sh
npm install -D tailwindcss
npm install tailwindcss-react-native
npm install --save-dev tailwindcss
npm install tailwind-react-native-classnames
npm install @react-navigation/native-stack
npm i react-native-animatable
npm i react-native-elements
npm install react-native-google-places-autocomplete --save
npm install valid-url
npm install lottie-react-native
npm i react-native-heroicons
npm i react-native-modal-datetime-picker
npx expo install react-native-modal-datetime-picker
npx expo install @react-native-community/datetimepicker
npm install react-native-range-timepicker
npm install patch-package
npm install deprecated-react-native-prop-types
npm install react-native-swipe-list-view --save
npm install react-native-action-button
```

## 📝 Firebase Database:

```sh
npm install --save firebase
expo install firebase
npm install @react-native-firebase/app --save
npm install @react-native-firebase/auth --save
npm i @expo/metro-config
npx expo customize metro.config.js
npm i firebase-admin
- For initial setup:
    - Need to enable Authentication using email/pass on firebase console page
```

## 📝 Profile module:

```sh
Login and Sign up features: https://www.positronx.io/react-native-firebase-login-and-user-registration-tutorial/
npm install email-validator
npm install formik
npm install yup
npm install react-native-reanimated
npm install reanimated-bottom-sheet
npm install @react-native-community/cli
npm i --save @react-native-community/google-signin
npm install react-native-image-crop-picker
npm i @react-native-picker/picker
```

## 📝 Social module:

```sh
npm i react-native-pell-rich-editor
npm i @react-navigation/drawer
```

## 📝 Modal component:

```sh
npm install react-native-dropdown-picker
```

## 📝 Maps component:

```sh
npm i axios
```

## in case bad things happen:

```sh
git reset HEAD^ --hard and git push --force
```

## in case bad things happen:

```sh
git reset HEAD^ --hard and git push --force

For Master branch messed up:
git checkout branch1
git merge -s ours master
git checkout master
git merge branch1
git push --force origin master
```

## 📝 Notes

- VSCode IDE Extension tools:

  - install Extension ES7+ snippet: (for enable shortcut create new js page: type rnfe/rnf)
  - install extension Github Copilot: can auto suggest long line code

- [Expo Router: Docs](https://expo.github.io/router)
- [Expo Router: Repo](https://github.com/expo/router)

- For Discovery Module's backend: using YELP API + Google Places API:

  - YELP API Key: https://www.yelp.com/developers/v3/manage_app
  - Created Google Console Cloud: https://console.cloud.google.com/getting-started?pli=1
  - Places API from Google: https://console.cloud.google.com/apis/library/places-backend.googleapis.com?authuser=2&organizationId=0&project=freshbeernearme-392607

- Some dependencies fixing hacks:
  - In most cases, this can be fixed by cleaning the application's cache. Depending on your workflow or favorite package manager that could be done by:
    - yarn start --reset-cache
    - npm start --reset-cache
    - expo start -c
      or other.
