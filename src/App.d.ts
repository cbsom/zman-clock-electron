import { Time, ZmanToShow } from "./jcal-zmanim/jcal-zmanim";

export type ZmanTime = {
  zmanType: ZmanToShow;
  time: Time;
  isTomorrow: boolean;
};
export type ShulZmanimType = {
  chatzosHayom: Time | null;
  chatzosHalayla: Time | null;
  alos: Time | null;
  shkia: Time | null;
};
