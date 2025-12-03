// 在HTML界面显示行动点
function updateActionPointsDisplay(ap) {
    document.getElementById('current-ap').textContent = ap;
    document.getElementById('current-day').textContent = getCurrentGameDay();
}

// 点击3D场景中的物体
function setup3DObjectClick(object, itemId, locationId) {
    object.userData = { itemId, locationId };
    object.cursor = 'pointer';
    // Three.js 渲染器中添加点击监听
    renderer.domElement.addEventListener('click', (event) => {
        const intersects = getIntersects(event); // Three.js 光线投射方法
        if (intersects.length > 0 && intersects[0].object.userData.itemId) {
            const data = intersects[0].object.userData;
            attemptPickUpItem(data.itemId, data.locationId);
        }
    });
}

async function attemptPickUpItem(itemId, locationId) {
    const player = currentPlayer;
    if (player.actionPoints <= 0) {
        alert("行动点不足！");
        return;
    }
    
    // 检查道具是否已被拾取
    const itemRef = ref(db, `locations/${locationId}/items/${itemId}`);
    const snapshot = await get(itemRef);
    const itemData = snapshot.val();
    
    if (itemData && !itemData.pickedUpBy) {
        // 随机事件：可能获得道具或线索，也可能扣血/扣san
        const outcome = rollRandomOutcome(player.luck);
        
        if (outcome.type === 'item') {
            // 添加到玩家背包
            const updates = {};
            updates[`players/${player.id}/inventory/${itemId}`] = { 
                id: itemId, 
                obtainedAt: new Date().toISOString() 
            };
            updates[`locations/${locationId}/items/${itemId}/pickedUpBy`] = player.id;
            
            await update(ref(db), updates);
            alert(`获得了：${outcome.itemName}`);
        } else if (outcome.type === 'damage') {
            await update(ref(db, `players/${player.id}`), {
                currentHealth: player.currentHealth - outcome.value
            });
            alert(`触发了陷阱！生命值 -${outcome.value}`);
        }
        
        // 扣除行动点
        await update(ref(db, `players/${player.id}`), {
            actionPoints: player.actionPoints - 1
        });
    }
}