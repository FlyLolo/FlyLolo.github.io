module.exports = {
  "title": "闲聊编程",
  "description": "Talk is cheap. Show me the code.",
  "dest": "public",
  "head": [
    [
      "link",
      {
        "rel": "icon",
        "href": "/favicon.ico"
      }
    ],
    [
      "meta",
      {
        "name": "viewport",
        "content": "width=device-width,initial-scale=1,user-scalable=no"
      }
    ]
  ],
  "theme": "reco",
  "themeConfig": {
    "nav": [
      {
        "text": "Home",
        "link": "/",
        "icon": "reco-home"
      },
      {
        "text": "TimeLine",
        "link": "/timeline/",
        "icon": "reco-date"
      },
      {
        "text": "Docs",
        "icon": "reco-message",
        "items": [
          {
            "text": "ASP.NET Core",
            "link": "/docs/asp.net-core/"
          },
          {
            "text": "SpringBoot",
            "link": "/docs/SpringBoot/"
          },
          {
            "text": "DesignPattern",
            "link": "/docs/DesignPattern/"
          }
        ]
      },
      {
        "text": "Contact",
        "icon": "reco-message",
        "items": [
          {
            "text": "GitHub",
            "link": "https://github.com/recoluan",
            "icon": "reco-github"
          }
        ]
      }
    ],
    "sidebar": {
      "/docs/theme-reco/": [
        "",
        "theme",
        "plugin",
        "api"
      ],
      "/docs/asp.net-core/":[
        '',
        'ASPNETCore2_1',
        'ASPNETCore2_2',
        'ASPNETCore2_3',
        'ASPNETCore2_4',
        'ASPNETCore2_5',
        'ASPNETCore2_6',
        'ASPNETCore2_7',
        'ASPNETCore2_8',
        'ASPNETCore2_9',
        'ASPNETCore2_10',
        'ASPNETCore2_11',
        'ASPNETCore2_12',
        'ASPNETCore2_13',
        'ASPNETCore2_14',
        'ASPNETCore2_15',
        'ASPNETCore2_16',
        'ASPNETCore2_17',
        'ASPNETCore2_18',
        'ASPNETCore2_19',
        'ASPNETCore2_20',
        'ASPNETCore2_21',
        'ASPNETCore_22',
        'ASPNETCore_23',
        'ASPNETCore_24',
        'ASPNETCore_25',
        'ASPNETCore2_26',
        'ASPNETCore2_27',
        'ASPNETCore_28'
      ]
    },
    "type": "blog",
    "blogConfig": {
      "category": {
        "location": 2,
        "text": "Category"
      },
      "tag": {
        "location": 3,
        "text": "Tag"
      }
    },
    "friendLink": [
      {
        "logo": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
        "title": "午后南杂",
        "desc": "Enjoy when you can, and endure when you must.",
        "email": "1156743527@qq.com",
        "link": "https://www.recoluan.com"
      },
      {
        "title": "vuepress-theme-reco",
        "desc": "A simple and beautiful vuepress Blog & Doc theme.",
        "logo": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
        "link": "https://vuepress-theme-reco.recoluan.com",
        "email": "1156743527@qq.com",
      }
    ],
    "logo": "/logo.png",
    "search": true,
    "searchMaxSuggestions": 10,
    "lastUpdated": "Last Updated",
    "author": "FlyLolo",
    "authorAvatar": "/avatar.png",
    "record": "xxxx",
    "startYear": "2017"
  },
  "markdown": {
    "lineNumbers": true
  }
}