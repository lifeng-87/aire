import { getDevGuildId } from "#utils/config";
import { ChatInputCommand, Command } from "@sapphire/framework";
import { ApplicationCommandType, AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import { request } from "undici";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
	name:"quote",
})
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
		const { content, mentions, author } = message;
		if (content === "")
			return interaction.reply("This message didn't provide content");

		await interaction.deferReply({ ephemeral: true });

		let slovedContent = content;
		mentions.parsedUsers.forEach((user) => {
			slovedContent = slovedContent.replace(
				`<@${user.id}>`,
				`@${user.username}`
			);
		});

		mentions.roles.forEach((role) => {
			slovedContent = slovedContent.replace(`<@&${role.id}>`, `@${role.name}`);
		});

		const displayAvatarURL = author.displayAvatarURL({
			forceStatic: true,
			size: 512,
			extension: "png",
		});

		/**
		 *
		 * @param avatarURL
		 * @param name
		 * @param content
		 * @returns
		 */
		const generateQuote = async (
			avatarURL: string,
			name: string,
			content: string
		) => {
			const avatarWidth = 512;
			const avatarHeight = 512;

			const canvas = createCanvas(avatarWidth * 2.5, avatarHeight);
			const ctx = canvas.getContext("2d");

			/**
			 *
			 * @param text
			 * @param maxWidth
			 * @param canvas
			 * @returns
			 */
			const warpText = (text: string, maxWidth: number) => {
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
				let line = "";
				arrayText.forEach((letter, i) => {
					const textLine = line + letter;
					const metrics = ctx.measureText(textLine);
					const testWidth = metrics.width;

					if (testWidth > maxWidth && i > 0) {
						lines.push(line);
						if (i === arrayText.length - 1) {
							lines.push(letter);
						}

						line = letter;
					} else if (i === arrayText.length - 1) {
						lines.push(textLine);
					} else {
						line = textLine;
					}
				});

				return lines;
			};

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
			const fontfamily = [
				"Noto Sans CJK TC",
				"Noto Sans CJK HK",
				"Noto Sans CJK JP",
				"Noto Sans CJK KR",
				"Noto Sans CJK SC",
				"Noto Sans",
				"sans-serif",
			].join(",");

			let fontSzie = 50;

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = `bold ${fontSzie}px ${fontfamily}`;
			ctx.fillStyle = "white";

			let maxLine = 0;
			let isOutOfMax = false;
			content.split(/\r\n|\n/).forEach((line) => {
				const textMaxMetrics = ctx.measureText(line);
				maxLine += Math.ceil(textMaxMetrics.width / textMaxWidth);
			});

			while (maxLine * fontSzie + 5 > textMaxHeight) {
				fontSzie -= 1;
				if (fontSzie <= 30) {
					maxLine = 10;
					isOutOfMax = true;
					break;
				}
			}

			ctx.font = `bold ${fontSzie}px ${fontfamily}`;

			const warpedText: string[] = [];
			content.split(/\r\n|\n/).forEach((line) => {
				warpText(line, textMaxWidth).forEach((text) => {
					warpedText.push(text);
				});
			});

			if (isOutOfMax)
				warpedText[maxLine - 1] = `${warpedText[maxLine - 1].substring(
					0,
					warpedText[maxLine - 1].length - 3
				)}...`;

			let x = avatarWidth + (canvas.width - avatarWidth) / 2;

			if (maxLine > 5) {
				ctx.textAlign = "left";
				x = avatarWidth + 50;
			}

			const yStart =
				(canvas.height - warpedText.slice(0, maxLine).length * fontSzie) / 2 -
				10;

			warpedText.slice(0, maxLine).forEach(async (line, i) => {
				ctx.fillText(line, x, yStart + (fontSzie + 5) * i);
			});

			ctx.textAlign = "end";
			ctx.font = `28px ${fontfamily}`;
			ctx.fillStyle = "rgb(190, 190, 190)";
			ctx.fillText(
				`- ${name}`,
				canvas.width - 50,
				canvas.height - 50,
				canvas.width - avatarWidth - 50
			);

			return canvas.toBuffer();
		};

		const attachment = new AttachmentBuilder(
			await generateQuote(displayAvatarURL, `${author.tag}`, slovedContent),
			{ name: "quote.png" }
		);

		void message.reply({
			content: `${interaction.member} make a quote from you!`,
			files: [attachment],
			allowedMentions: { repliedUser: true },
		});

		return interaction.editReply({ content: "👍" });
	}
}
