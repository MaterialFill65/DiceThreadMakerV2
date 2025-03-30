import { CardMetaWithGroup } from "./card";

export type CardGroup = {
    name: string;
    color: string;
    image: string;
}

export const PRESET_GROUPS: CardGroup[] = [
    {
        name: "ふつう",
        color: "transparent",
        image: "./normal.svg"
    },
    {
        name: "ちびぐるみ",
        color: "transparent",
        image: "./nui.svg"
    },
    {
        name: "画像",
        color: "transparent",
        image: "./image.svg"
    },
    {
        name: "その他",
        color: "transparent",
        image: "./others.svg"
    }
]

export const PRESETS: CardMetaWithGroup[] = [
    {
        name: "咲季",
        background: "#f78b8b",
        charactor_img: "./normal/saki.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "手毬",
        background: "#cae2fa",
        charactor_img: "./normal/temari.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "ことね",
        background: "#f6fa82",
        charactor_img: "./normal/kotone.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "麻央",
        background: "#f68be9",
        charactor_img: "./normal/mao.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: -10, y: 0 },
        group: "ふつう"
    },
    {
        name: "リーリヤ",
        background: "#edfdff",
        charactor_img: "./normal/lilja.webp",
        size: { x: 1, y: 1 },
        font_size: 40,
        img_scale: 50,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "千奈",
        background: "#f9ad60",
        charactor_img: "./normal/china.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "清夏",
        background: "#a3fd4b",
        charactor_img: "./normal/sumika.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 80,
        img_pos: { x: -10, y: 0 },
        group: "ふつう"
    },

    {
        name: "広",
        background: "#4bc7db",
        charactor_img: "./normal/hiro.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: -10, y: 0 },
        group: "ふつう"
    },
    {
        name: "莉波",
        background: "#f8c2d4",
        charactor_img: "./normal/rinami.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "佑芽",
        background: "#f08472",
        charactor_img: "./normal/ume.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 60,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "美鈴",
        background: "#9fb5dc",
        charactor_img: "./normal/misuzu.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 60,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "星南",
        background: "#f8c482",
        charactor_img: "./normal/sena.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "燕",
        background: "#a194f3",
        charactor_img: "./normal/tsubame.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "あさり",
        background: "#a6e4c7",
        charactor_img: "./normal/asari.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 60,
        img_pos: { x: -10, y: 0 },
        group: "ふつう"
    },
    {
        name: "邦夫",
        background: "#f6b445",
        charactor_img: "./normal/kunio.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "優",
        background: "#9e9cf1",
        charactor_img: "./normal/yu.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 80,
        img_pos: { x: -11, y: -8 },
        group: "ふつう"
    },
    {
        name: "燐羽",
        background: "#7e6da3",
        charactor_img: "./normal/rinha.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "撫子",
        background: "#f9b3ff",
        charactor_img: "./normal/nadeshiko.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "四音",
        background: "#e64e76",
        charactor_img: "./normal/shion.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 80,
        img_pos: { x: -20, y: 0 },
        group: "ふつう"
    },
    {
        name: "月花",
        background: "#ad9178",
        charactor_img: "./normal/gekka.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 65,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "黒井",
        background: "#fff",
        charactor_img: "./normal/kuroi.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 75,
        img_pos: { x: -10, y: -10 },
        group: "ふつう"
    },
    {
        display_name: "Voトレーナー",
        name: "Vo<font size='5'>トレーナー</font>",
        background: "#f2178b",
        charactor_img: "./normal/Vo.webp",
        size: { x: 1, y: 1 },
        font_size: 45,
        img_scale: 55,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        display_name: "Daトレーナー",
        name: "Da<font size='5'>トレーナー</font>",
        background: "#0899f7",
        charactor_img: "./normal/Da.webp",
        size: { x: 1, y: 1 },
        font_size: 45,
        img_scale: 55,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        display_name: "Viトレーナー",
        name: "Vi<font size='5'>トレーナー</font>",
        background: "#feb209",
        charactor_img: "./normal/Vi.webp",
        size: { x: 1, y: 1 },
        font_size: 45,
        img_scale: 45,
        img_pos: { x: 0, y: 0 },
        group: "ふつう"
    },
    {
        name: "学P",
        background: "#fff",
        charactor_img: "./normal/producer.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 30,
        img_pos: { x: 15, y: 0 },
        group: "ふつう"
    },

    // ちびぐるみ
    {
        name: "さき",
        background: "#f78b8b",
        charactor_img: "./nui/saki.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 60,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "てまり",
        background: "#cae2fa",
        charactor_img: "./nui/temari.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 50,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "ことね",
        background: "#f6fa82",
        charactor_img: "./nui/kotone.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 45,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "まお",
        background: "#f68be9",
        charactor_img: "./nui/mao.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 45,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "りーりや",
        background: "#edfdff",
        charactor_img: "./nui/lilja.webp",
        size: { x: 1, y: 1 },
        font_size: 40,
        img_scale: 45,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "ちな",
        background: "#f9ad60",
        charactor_img: "./nui/china.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale:  45,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "すみか",
        background: "#a3fd4b",
        charactor_img: "./nui/sumika.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 45,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "ひろ",
        background: "#4bc7db",
        charactor_img: "./nui/hiro.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 55,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "りなみ",
        background: "#f8c2d4",
        charactor_img: "./nui/rinami.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 45,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "うめ",
        background: "#f08472",
        charactor_img: "./nui/ume.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 50,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "みすず",
        background: "#9fb5dc",
        charactor_img: "./nui/misuzu.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 50,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },
    {
        name: "せな",
        background: "#f8c482",
        charactor_img: "./nui/sena.webp",
        size: { x: 1, y: 1 },
        font_size: 50,
        img_scale: 50,
        img_pos: { x: 0, y: 0 },
        group: "ちびぐるみ"
    },

    //その他
    {
        display_name: "はつみちゃん",
        name: "はつみ<font size='5'>ちゃん</font>",
        background: "#f8c482",
        charactor_img: "./normal/hatsumi.webp",
        size: { x: 1, y: 1 },
        font_size: 45,
        img_scale: 50,
        img_pos: { x: 0, y: 0 },
        group: "その他"
    },

    // 画像
    {
        name: "",
        background: "0 / cover url(./assets/image.webp)",
        size: { x: 1, y: 1 },
        font_size: 45,
        img_scale: 100,
        img_pos: { x: 0, y: 0 },
        group: "画像",
        isNumberVisible: false
    }
];
