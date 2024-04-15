require("dotenv").config();
const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy");
const { hydrate } = require("@grammyjs/hydrate");
const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

let activeSystem = false;

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск системы",
  },
  {
    command: "stop",
    description: "Отключение системы",
  },
  {
    command: "share",
    description: "тесты",
  },
  {
    command: "inline_keyboard",
    description: "тесты",
  },
  {
    command: "rylet",
    description: "застрелиться",
  },
  {
    command: "menu",
    description: "Получить менью",
  },
]);

bot.command("start", async (ctx) => {
  // console.log(ctx.command.text); комманда вызывающая ошибку
  if (activeSystem) {
    await ctx.reply("Система уже активна");
  } else {
    activeSystem = true;
    await ctx.reply("Система активна");
  }
});

bot.command("stop", async (ctx) => {
  if (!activeSystem) {
    await ctx.reply("Система уже отключена");
  } else {
    activeSystem = false;
    bot.stop();
    await ctx.reply("Система отключена");
  }
});

const menuKeyboard = new InlineKeyboard()
  .text("Узнать статус заказа", "order-status")
  .text("Обратитья в тех поддержку", "support");
const backKeyboard = new InlineKeyboard().text("< Назад в меню", "back");

bot.command("menu", async (ctx) => {
  await ctx.reply("Выберите пункт в меню ", {
    reply_markup: menuKeyboard,
  });
});

bot.callbackQuery("order-status", async (ctx) => {
  await ctx.callbackQuery.message.editText("Ваш заказ в пути", {
    reply_markup: backKeyboard,
  })
});
bot.callbackQuery("support", async (ctx) => {
  await ctx.callbackQuery.message.editText("У нас ее нет сори", {
    reply_markup: backKeyboard,
  })
});
bot.callbackQuery("back", async (ctx) => {
  await ctx.callbackQuery.message.editText("Выберите пункт в меню", {
    reply_markup: menuKeyboard,
  })
});

bot.command("mood", async (ctx) => {
  // const moodKeyboard = new Keyboard()
  //   .text("Хорошо")
  //   .row()
  //   .text("Нормально")
  //   .row()
  //   .text("Плохо")
  //   .row()
  //   .resized()
  //   .oneTime();

  const moodLabels = ["Хорошо", "Нормально", "Плохо"];
  const rows = moodLabels.map((label) => {
    return [Keyboard.text(label)];
  });
  const moodKeyboard2 = Keyboard.from(rows).resized();
  await ctx.reply("как вашь день", {
    reply_markup: moodKeyboard2,
  });
});

bot.command("share", async (ctx) => {
  const shareKeyboard = new Keyboard()
    .requestLocation("Тест1")
    .requestContact("Тест2")
    .requestPoll("Тест3")
    .placeholder("мимимамому")
    .resized()
    .oneTime();

  await ctx.reply("выберите вариант ответа", {
    reply_markup: shareKeyboard,
  });
});

bot.command("inline_keyboard", async (ctx) => {
  // const inlineKeyboard = new InlineKeyboard()
  //   .text("1", "button1")
  //   .text("2", "button2")
  //   .text("3", "button3");

  const inlineKeyboard2 = new InlineKeyboard().url(
    "перейти в тг канал",
    "https://t.me/xosiaox"
  );

  await ctx.reply("Выберите цифру", {
    reply_markup: inlineKeyboard2,
  });
});

bot.callbackQuery(/button[1-3]/, async (ctx) => {
  ctx.answerCallbackQuery("ZZZZZZZZZZZZZZZZZZZ");
  ctx.reply("Вы выбрали кнопку: " + ctx.callbackQuery.data);
});

bot.on(":contact", async (ctx) => {
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name;
  const lastName = contact.last_name;

  await ctx.reply(
    `Пользователь ${firstName} ${lastName} поделился своим ${phoneNumber}`
  );
  console.log(contact);
});

bot.hears("Хорошо", async (ctx) => {
  ctx.reply("Хорошо это хорошо");
});

bot.hears("Нормально", async (ctx) => {
  ctx.reply("Нормально это ещё хорошо");
});

bot.hears("Плохо", async (ctx) => {
  ctx.reply("Плохо это не хорошо");
});

bot.command("rylet", async (ctx) => {
  ctx.reply("Вращаем барабан");
  const randomN = Math.floor(Math.random() * 6) + 1;
  setTimeout(() => {
    if (4 == randomN) {
      ctx.reply("Вы мертвы");
      console.log("Фортуна не улыбнулась игроку ", ctx.message.from);
    } else {
      ctx.reply("Вам повезло");
      console.log("Фортуна улыбнулась игроку ", ctx.message.from);
    }
  }, 3000);
});

bot.hears([`пинг`, `понг`], async (ctx) => {
  if (ctx.msg.text == `пинг`) {
    await ctx.reply(`понг`);
  } else {
    await ctx.reply("пинг");
  }
});

bot.hears(["ID", "id"], async (ctx) => {
  await ctx.reply(ctx.from.id, {
    reply_parameters: { message_id: ctx.msg.message_id },
  });
});

bot.on("message:text", async (ctx) => {
  console.log(
    "Получено сообщение",
    ctx.message.text,
    `от ${ctx.from.username}`
  );
  await ctx.react("👌");
  await ctx.reply(`<b>Получено сообщение</b> от ${ctx.from.username}`, {
    parse_mode: "HTML",
  });
});

bot.on("message:voice", async (ctx) => {
  console.log("Получено голосовое сообщение", ctx.message.voice);
  await ctx.reply(
    "Простите я не умею слушать голосовые, но если вам будет легче они сохраняются в базу данных и разработчик посмееться с них <3"
  );
});

bot.on("message:media", async (ctx) => {
  console.log("Получено фото", ctx.message.photo);
  await ctx.reply("Получено фото");
});

bot.on("msg", (ctx) => {
  console.log("полученно что то? -", ctx.text);
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(ctx);
  console.error(`Упс, разработчик еблан потому что ${ctx.update.update_id}`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Ошибка в запросе", e.description);
  } else if (e instanceof HttpError) {
    console.error("отсутствует поключение к телеграмму", e);
  } else {
    console.error("Неизвестная ошибка?!", e);
  }
});

bot.start();
