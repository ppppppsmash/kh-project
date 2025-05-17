import { IncomingWebhook } from "@slack/webhook";
import { formatDate } from "@/lib/utils";

type paramType = {
  message: string;
}

export const sendSlackMessage = async ({ message }: paramType) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL as string;
  const webhook = new IncomingWebhook(webhookUrl);

  const date = formatDate(new Date(), "yyyy/MM/dd HH:mm:ss");

  const payload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "新規タスクが追加されました",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `:notebook:*タスク:*\n${message}`,
          },
          {
            type: "mrkdwn",
            text: `:clock1:*日時:*\n${date}`,
          }
        ],
      },
    ],
  };

  await webhook.send(payload);
};
