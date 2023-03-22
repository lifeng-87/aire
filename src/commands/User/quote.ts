import { getDevGuildId } from "#utils/config";
import { ChatInputCommand, Command } from "@sapphire/framework";
import { ApplicationCommandType, AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { request } from "undici";
import warp from "word-wrap";

export class UserCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(
		registry: ChatInputCommand.Registry
	) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName(this.name)
					.setType(ApplicationCommandType.Message),
			{ guildIds: getDevGuildId() }
		);
	}

	public async contextMenuRun(
		interaction: Command.ContextMenuCommandInteraction<"cached">
	) {
		if (!interaction.isMessageContextMenuCommand()) return;

		const message = interaction.targetMessage;
		const { content } = message;
		const authorName = message.member?.nickname || message.author.username;
		const displayAvatarURL =
			message.member?.displayAvatarURL({
				forceStatic: true,
				size: 512,
				extension: "jpg",
			}) ||
			message.author.displayAvatarURL({
				forceStatic: true,
				size: 512,
				extension: "jpg",
			});

		const { body } = await request(displayAvatarURL);
		const avatar = await loadImage(await body.arrayBuffer());

		const canvas = createCanvas(avatar.width * 2.5, avatar.width);
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "black";
		ctx.fillRect(avatar.width, 0, canvas.width - avatar.width, canvas.height);
		ctx.drawImage(avatar, 0, 0, avatar.width, canvas.height);

		const imgArrData = ctx.getImageData(0, 0, avatar.width, avatar.height);
		for (let i = 0; i < imgArrData.data.length; i += 4) {
			const r = imgArrData.data[i];
			const g = imgArrData.data[i + 1];
			const b = imgArrData.data[i + 2];

			const avg = (r + g + b) / 3;

			imgArrData.data[i] = avg;
			imgArrData.data[i + 2] = avg;
			imgArrData.data[i + 1] = avg;
		}

		ctx.putImageData(imgArrData, 0, 0);

		const grdWidth = avatar.width * 0.2;
		const grd = ctx.createLinearGradient(
			avatar.width - grdWidth,
			0,
			avatar.width,
			0
		);
		grd.addColorStop(0, "rgba(0, 0, 0, 0)");
		grd.addColorStop(0.3, "rgba(0, 0, 0, 0.2)");
		grd.addColorStop(1, "black");

		ctx.fillStyle = grd;
		ctx.fillRect(avatar.width - grdWidth, 0, grdWidth, avatar.height);

		const textH = 50;
		const maxLines = 3;
		ctx.textAlign = "center";
		ctx.font = `blod ${textH}px NotoSansTC`;
		ctx.fillStyle = "white";

		const warpedText = warpText(content, 20);

		if (warpedText.length > maxLines)
			warpedText[maxLines - 1] = `${warpedText[maxLines - 1].slice(
				0,
				warpedText[maxLines - 1].length - 3
			)}...`;

		const yStart =
			canvas.height / 2 - (Math.min(warpedText.length, 3) * textH) / 2;

		let y = yStart;
		warpedText.slice(0, maxLines).forEach((s) => {
			ctx.fillText(
				s,
				avatar.width + (canvas.width - avatar.width) / 2,
				y,
				canvas.width - avatar.width - 100
			);

			y += textH;
		});

		ctx.textAlign = "end";
		ctx.font = "28px NotoSansTC";
		ctx.fillStyle = "rgb(199, 199, 199)";
		ctx.fillText(
			`- ${authorName}`,
			canvas.width - 60,
			canvas.height - 60,
			canvas.width - avatar.width - 100
		);

		const attachment = new AttachmentBuilder(await canvas.encode("png"), {
			name: "quote-image.png",
		});

		return interaction.reply({ files: [attachment] });
	}
}

function warpText(text: string, width: number) {
	text = text.replaceAll("\r\n", "\n");
	const lines: string[] = [];
	text.split("\n").forEach((i) => {
		warp(i, { width, newline: "\n" })
			.split("\n")
			.forEach((s) => {
				lines.push(s);
			});
	});

	return lines;
}
