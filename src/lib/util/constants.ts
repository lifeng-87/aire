import { join } from "path";

export const mainFolder = process.cwd();
export const rootFolder = join(mainFolder, "src");

export const ZeroWidthSpace = "\u200B";
export const LongWidthSpace = "\u3000";

export const enum Emojis {
  ArrowLeft = "<:rtbyte_arrow_left:801917830710558790>",
  ArrowRight = "<:rtbyte_arrow_right:801918001124212837>",
  ArrowToLeft = "<:rtbyte_arrow_to_left:801918098571395133>",
  ArrowToRight = "<:rtbyte_arrow_to_right:801918207077777409>",
  BotBadge = "<:rtbyte_bot_badge:801919189664399391>",
  Check = "<:rtbyte_check:801917144237211669>",
  Dnd = "<:rtbyte_dnd:801918926417559552>",
  Idle = "<:rtbyte_idle:801918753679212544>",
  Info = "<:rtbyte_info:801918407023919124>",
  List = "<:rtbyte_list:801918507666374679>",
  Offline = "<:rtbyte_offline:801919060303806504>",
  Online = "<:rtbyte_online:801918663233241099>",
  PartnerBadge = "<:rtbyte_partnered_badge:801919416429838366>",
  VerifiedBadge = "<:rtbyte_verified_badge:801919582696505364>",
  Warning = "<:rtbyte_warning:898950475628552223>",
  X = "<:rtbyte_x:801917320728543275>",
}
