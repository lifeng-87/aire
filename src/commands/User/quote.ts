import { getDevGuildId } from "#utils/config";
import { ChatInputCommand, Command } from "@sapphire/framework";
import { ApplicationCommandType, AttachmentBuilder } from "discord.js";
import { Canvas, createCanvas, loadImage } from "canvas";
import { request } from "undici";

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
		if (content === "")
			return interaction.reply("This message didn't provide content");

		const authorName = message.member?.nickname
			? message.member.nickname
			: message.author.username;
		const displayAvatarURL =
			message.member?.displayAvatarURL({
				forceStatic: true,
				size: 512,
				extension: "png",
			}) ||
			message.author.displayAvatarURL({
				forceStatic: true,
				size: 512,
				extension: "png",
			});

		const attachment = new AttachmentBuilder(
			await generateQuote(displayAvatarURL, authorName, content),
			{ name: "quote.png" }
		);

		return interaction.reply({ files: [attachment] });
	}
}

async function generateQuote(avatarURL: string, name: string, content: string) {
	const avatarWidth = 512;
	const avatarHeight = 512;

	const canvas = createCanvas(avatarWidth * 2.5, avatarHeight);
	const ctx = canvas.getContext("2d");

	const { body } = await request(avatarURL);
	const avatar = await loadImage(Buffer.from(await body.arrayBuffer()));

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(avatar, 0, 0, avatarWidth, canvas.height);

	const imgArrData = ctx.getImageData(0, 0, avatarWidth, avatarHeight);
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

	const grdWidth = avatarWidth * 0.2;
	const grd = ctx.createLinearGradient(
		avatarWidth - grdWidth,
		0,
		avatarWidth,
		0
	);
	grd.addColorStop(0, "rgba(0, 0, 0, 0)");
	grd.addColorStop(1, "black");

	ctx.fillStyle = grd;
	ctx.fillRect(avatarWidth - grdWidth, 0, grdWidth, avatarHeight);

	const textMaxWidth = canvas.width - avatarWidth - 100;
	const textMaxHeight = canvas.height - 100;
	const fontfamily = "sans-serif";
	let fontSzie = 50;

	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = `${fontSzie}px ${fontfamily}`;
	ctx.fillStyle = "white";

	const textMaxMetrics = ctx.measureText(content.replace(/\r|\n/, ""));

	const maxLine = Math.floor(textMaxMetrics.width / textMaxWidth);

	while (maxLine * fontSzie > textMaxHeight && fontSzie > 12) {
		fontSzie -= 1;
	}

	ctx.font = `${fontSzie}px ${fontfamily}`;

	const warpedText: string[] = [];
	content
		.replace("\r\n", "\n")
		.split("\n")
		.forEach((line) => {
			warpText(line, textMaxWidth, canvas).forEach((text) => {
				warpedText.push(text);
			});
		});

	const yStart =
		(canvas.height - warpedText.slice(0, maxLine).length * fontSzie) / 2;

	warpedText.slice(0, maxLine).forEach((line, i) => {
		ctx.fillText(
			line,
			avatarWidth + (canvas.width - avatarWidth) / 2,
			yStart + fontSzie * i
		);
	});

	ctx.textAlign = "end";
	ctx.font = "28px NotoSansTC-Black, sans-serif";
	ctx.fillStyle = "rgb(199, 199, 199)";
	ctx.fillText(
		`- ${name}`,
		canvas.width - 50,
		canvas.height - 50,
		canvas.width - avatarWidth - 50
	);

	return canvas.toBuffer();
}

function warpText(text: string, maxWidth: number, canvas: Canvas) {
	const ctx = canvas.getContext("2d");
	const textSpace = text.split(" ");

	const arrayText: string[] = [];
	textSpace
		.map((text) => `${text} `)
		.forEach((text) => {
			const metrics = ctx.measureText(text);
			if (metrics.width > maxWidth) {
				text.split("").forEach((letter) => {
					arrayText.push(letter);
				});
			} else {
				arrayText.push(text);
			}
		});

	const lines: string[] = [];
	arrayText.reduce((line, letter, i) => {
		const textLine = line + letter;
		const metrics = ctx.measureText(textLine);
		const testWidth = metrics.width;

		if (testWidth > maxWidth && i > 0) {
			lines.push(line);
			if (i === arrayText.length - 1) {
				lines.push(letter);
			}

			return letter;
		}

		if (i === arrayText.length - 1) {
			lines.push(textLine);
		}
		return textLine;
	});
	return lines;
}
