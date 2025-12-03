// 管理员前端界面（独立的HTML页面，或游戏内密码访问的界面）
// 监听所有玩家数据
const playersRef = ref(db, 'players');
onValue(playersRef, (snapshot) => {
    const players = snapshot.val();
    renderAdminPlayerList(players); // 在管理员界面渲染表格
});

// 修改玩家属性
async function adminUpdatePlayer(playerId, updates) {
    const confirm = window.confirm(`确定要修改玩家 ${playerId} 的数据吗？`);
    if (confirm) {
        await update(ref(db, 'players/' + playerId), updates);
    }
}

// 格式化游戏（重置）
async function adminResetGame() {
    if (window.confirm("警告：这将清除所有游戏数据！确定继续吗？")) {
        // 1. 备份当前状态（可选）
        // 2. 重置所有地点道具
        const resetUpdates = {};
        const locations = await get(ref(db, 'locations'));
        
        locations.forEach((loc) => {
            if (loc.val().items) {
                Object.keys(loc.val().items).forEach(itemId => {
                    resetUpdates[`locations/${loc.key}/items/${itemId}/pickedUpBy`] = null;
                });
            }
        });
        
        // 3. 重置玩家状态（不清除角色，但重置位置、行动点等）
        const players = await get(ref(db, 'players'));
        players.forEach((player) => {
            resetUpdates[`players/${player.key}/actionPoints`] = 10;
            resetUpdates[`players/${player.key}/currentHealth`] = player.val().maxHealth;
            resetUpdates[`players/${player.key}/currentSanity`] = player.val().maxSanity;
        });
        
        // 4. 增加天数，更新重置时间
        resetUpdates['gameState/currentDay'] = serverTimestamp();
        resetUpdates['gameState/lastResetTime'] = new Date().toISOString();
        resetUpdates['gameState/nextResetTime'] = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        
        await update(ref(db), resetUpdates);
        alert("游戏已重置！");
    }
}