export type Firmware = {
  firmwareUid: string;
  product: string;
  label: string;
  file: string;
  version: string;
  userUid: string;
  startDate: string;
  endDate: string;
  isSuspended: boolean;
};

export type FirmwareUpdate = Firmware;
