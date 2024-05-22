import { WalletType } from "./global-types";

type CurrentTokenType = { token: string; expiry_date: number }
export class CurrentToken {
  static storageKey: string = 'CURRENT_TOKEN';

  get = (): Partial<CurrentTokenType> => {
    const jsonSting = localStorage.getItem(CurrentToken.storageKey);
    if (jsonSting) {
      return JSON.parse(jsonSting)
    }
    return {};
  };

  set = ({ token, expiry_date }: CurrentTokenType) => {
    localStorage.setItem(CurrentToken.storageKey, JSON.stringify({ token, expiry_date }));
  };

  remove = () => {
    localStorage.removeItem(CurrentToken.storageKey);
  };
}

export class CurrentConnectedWallet {
  static storageKey: string = 'CURRENT_CONNECTED_WALLET';

  get = () => {
    return localStorage.getItem(CurrentConnectedWallet.storageKey) as WalletType | null;
  };

  set = ({ wallet }: { wallet: WalletType }) => {
    localStorage.setItem(CurrentConnectedWallet.storageKey, wallet);
  };

  remove = () => {
    localStorage.removeItem(CurrentConnectedWallet.storageKey);
  };
}


