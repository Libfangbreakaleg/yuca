async function initiateCombat(attackerId, defenderId) {
    const combatId = 'combat_' + Date.now();
    await set(ref(db, 'combatRequests/' + combatId), {
        fromPlayerId: attackerId,
        toPlayerId: defenderId,
        status: 'pending',
        turn: attackerId,
        createdAt: new Date().toISOString()
    });
    // 实时监听战斗状态变化
    onValue(ref(db, 'combatRequests/' + combatId), (snapshot) => {
        const combat = snapshot.val();
        if (combat && combat.status === 'accepted') {
            renderCombatInterface(combat);
        }
    });
}

async function resolveCombatTurn(combatId, attackerId, defenderId, action) {
    const [attacker, defender] = await Promise.all([
        get(ref(db, 'players/' + attackerId)),
        get(ref(db, 'players/' + defenderId))
    ]);
    
    const att = attacker.val();
    const def = defender.val();
    
    // 伤害计算示例：基础伤害 + 力量差 + 随机因素
    let baseDamage = 10;
    let strengthDiff = att.strength - def.strength;
    let randomFactor = Math.random() * 10 - 5; // -5 到 +5 的随机值
    let finalDamage = Math.max(1, Math.floor(baseDamage + strengthDiff * 0.5 + randomFactor));
    
    // 敏捷影响命中率
    const hitChance = Math.min(90, 70 + (att.agility - def.agility));
    const isHit = Math.random() * 100 < hitChance;
    
    const updates = {};
    if (isHit) {
        updates[`players/${defenderId}/currentHealth`] = def.currentHealth - finalDamage;
        updates[`combatRequests/${combatId}/lastAction`] = `${att.name} 对 ${def.name} 造成 ${finalDamage} 点伤害！`;
    } else {
        updates[`combatRequests/${combatId}/lastAction`] = `${att.name} 的攻击被 ${def.name} 闪避了！`;
    }
    
    // 切换回合
    updates[`combatRequests/${combatId}/turn`] = defenderId;
    
    await update(ref(db), updates);
}