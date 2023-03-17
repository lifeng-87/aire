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

  Next = "<:next:1085909310938296340>",
  Pause = "<:pause:1085909303568908288>",
  Play = "<:play:1085909321335963708>",
  Repeat = "<:repeat:1085909307700297749>",
  Shuffle = "<:shuffle:1085909319637278800>",
  Skip = "<:skip:1085909306400063568>",
  Sound = "<:sound:1085909312460820571>",
  SoundLoud = "<:sound_loud:1086384468857720983>",
  Stop = "<:stop:1085909315283603586>",
  Undo = "<:undo:1085909316961304687>",
  Adjust = "<:adjust:1086384443754827867>",
  Album = "<:album:1086384456450973728>",
  Fastforward = "<:fastforward:1086384441506660412>",
  FastforwardToEnd = "<:fastforward_to_end:1086384437845033053>",
  Headphone = "<:headphone:1086384460204875886>",
  Live = "<:live:1086384452051152986>",
  PlaylistAdd = "<:playlist_add:1086384465166733412>",
  PlaylistPlay = "<:playlist_play:1086384461886795838>",
  Search = "<:search:1086384454504816651>",
  VolumeAdd = "<:volume_add:1086384446875381801>",
  VolumeSub = "<:volume_sub:1086384449924649074>",
}
