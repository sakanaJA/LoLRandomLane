const { Client, Intents, Permissions, MessageEmbed, Collection } = require('discord.js');
const { readdirSync } = require('fs');

// Discordクライアントの設定
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    disableMentions: 'everyone',
});

// コンフィグファイルの読み込み
client.config = require('./config');

// コマンドの読み込み
client.commands = new Collection();
readdirSync('./commands/').forEach(dirs => {
    const commands = readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));
    for (const file of commands) {
        const command = require(`./commands/${dirs}/${file}`);
        client.commands.set(command.name.toLowerCase(), command);
    };
});
// LoLのレーン
const lanes = ['トップ', 'ミッド', 'ジャングル', 'ボット', 'サポート'];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    if (message.content === '!ランダム' || message.content === '!random' || message.content === '!レーン' || message.content === '!lane') {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.channel.send('ボイスチャンネルに参加してください。');
        }

        try {
            // voiceChannel.membersを配列に変換
            const members = Array.from(voiceChannel.members.values());
            if (members.length > lanes.length) {
                return message.channel.send('参加メンバーが多すぎます。');
            }

            const assignedLanes = assignLanes(members, lanes);
            const response = formatAssignedLanes(assignedLanes);

            message.channel.send(response);
        } catch (error) {
            console.error(error);
            message.channel.send('エラーが発生しました。');
        }
    }
});

function assignLanes(members, lanes) {
    // レーンをランダムに割り当て
    const shuffledLanes = lanes.sort(() => 0.5 - Math.random());
    const assignments = {};

    members.forEach((member, index) => {
        // ここでdisplayNameを使用
        assignments[member.displayName] = shuffledLanes[index];
    });

    return assignments;
}

function formatAssignedLanes(assignments) {
    return Object.entries(assignments)
        .map(([user, lane]) => `${user}: ${lane}`)
        .join('\n');
}

// ボットのログイン
client.login(process.env.TOKEN);
