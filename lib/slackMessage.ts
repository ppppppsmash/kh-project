import { IncomingWebhook } from "@slack/webhook";

type paramType = {
  message: string;
}

export const sendSlackMessage = async ({ message }: paramType) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL as string;
  const webhook = new IncomingWebhook(webhookUrl);

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
        ],
      },
    ],
  };

  await webhook.send(payload);
};
