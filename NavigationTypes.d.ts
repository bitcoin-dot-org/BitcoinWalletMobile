type RootNavigationParamList =  {
    Root: undefined
    CreateStepOne: undefined
    CreateStepTwo: { words : string[] }
    Restore: undefined
    PickerView: { type : "Choose Currency" | "Choose Language" };
    ScanQRCode: { callBack : (address : string, amount : string | null) => void }
    Send: undefined
  };

  type WalletHomeNavigationParamList =  {
    Overview: undefined
    Send: undefined
    Receive: undefined
    Settings: undefined
  };
