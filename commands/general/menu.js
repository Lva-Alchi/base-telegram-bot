const { Markup } = require('telegraf');
const t = require('../../src/utils/i18n');

module.exports = {
    name: 'menu',
    description: 'Menampilkan Menu Utama interaktif',
    showInMenu: true,
    async execute(ctx) {
      const unique = new Set(ctx.commandsList.values()); //Cegah duplikasi
      const categories = {};
      
      for (const cmd of unique) {
            if (cmd.showInMenu === false) continue;
            const categoryName = cmd.category || '📦 Lainnya';
            if (!categories[categoryName]) {
                categories[categoryName] = [];
            }
            let cmdNames = Array.isArray(cmd.name) 
                ? cmd.name.map(n => `/${n}`).join(', ') 
                : `/${cmd.name}`;

            const cmdDesc = t(ctx.dbLang, cmd.description) || 'Tidak ada deskripsi';

            categories[categoryName].push({ names: cmdNames, desc: cmdDesc });
        }
      
      let menuText = "༺ 𝐃𝐚𝐟𝐭𝐚𝐫 𝐏𝐞𝐫𝐢𝐧𝐭𝐚𝐡 𝐁𝐨𝐭 ༻\n\n";

      for (const [category, commands] of Object.entries(categories)) {
          menuText += `┏━━─> ${category}\n`;
          for (const cmd of commands) {
                menuText += `┠> ${cmd.names} - ${cmd.desc}\n`;
            }
          menuText += `\n`;
        };

      // Membuat Reply Keyboard (Menu Bawah)
      const keyboard = Markup.keyboard([
          ['👤 Profil', '💳 Cek Kuota'], // Baris 1: Dua tombol sejajar
          ['❌ Close ']                   // Baris 2: Satu tombol lebar
        ]).resize(); // PENTING: Agar ukuran tombol mengecil menyesuaikan layar HP

      await ctx.replyWithMarkdown(menuText, keyboard);
    }
};