// Source phrases are presentation keys; simulation IDs and save data stay language-neutral.
let rows=`
Язык|Language|Sprache|语言
Язык интерфейса|Interface language|Sprache der Oberfläche|界面语言
Настройки|Settings|Einstellungen|设置
Закрыть настройки|Close settings|Einstellungen schließen|关闭设置
Главное меню Corepolis|Corepolis main menu|Corepolis-Hauptmenü|Corepolis 主菜单
Главные действия|Main actions|Hauptaktionen|主要操作
Каталог моделей|Model catalog|Modellkatalog|模型目录
Начать игру|Start game|Spiel starten|开始游戏
Продолжить|Continue|Fortsetzen|继续
Нет сохранения|No saved game|Kein Spielstand|无存档
СОХРАНЕНО |SAVED |GESPEICHERT |已保存 
Сохранено|Saved|Gespeichert|已保存
Поддержать|Support|Unterstützen|支持
Portfolio|Portfolio|Portfolio|作品集
ISLAND CARD BUILDER|ISLAND CARD BUILDER|INSEL-KARTENSTRATEGIE|岛屿卡牌建造游戏
Corepolis (Кореполис) — бесплатная карточная стратегия в браузере. Стройте город на островах, добывайте ресурсы и открывайте исследования. Планируйте каждый ход: карты и материалы ограничены.|Corepolis is a free browser card strategy game. Build an island city, gather resources and unlock research. Plan every move: cards and materials are limited.|Corepolis ist ein kostenloses Kartenstrategiespiel im Browser. Baue eine Inselstadt, gewinne Ressourcen und erforsche neue Möglichkeiten. Plane jeden Zug: Karten und Materialien sind begrenzt.|Corepolis 是一款免费的浏览器卡牌策略游戏。建造岛屿城市，收集资源并开展研究。规划每一步：卡牌与材料数量有限。
Движение камеры|Camera motion|Kamerabewegung|镜头移动
Медленный кинематографичный облёт острова в главном меню.|Slow cinematic orbit around the island in the main menu.|Langsamer filmischer Kameraflug um die Insel im Hauptmenü.|主菜单中缓慢环绕岛屿的电影式镜头。
Анимации интерфейса|Interface animations|Oberflächenanimationen|界面动画
Переходы, появления карточек и декоративные UI-анимации.|Transitions, card entrances and decorative UI animations.|Übergänge, Karteneinblendungen und dekorative Animationen.|过渡、卡牌出现及装饰性界面动画。
Переходы, карточки и декоративные эффекты UI.|Transitions, cards and decorative UI effects.|Übergänge, Karten und dekorative Effekte.|过渡、卡牌及装饰性界面效果。
Качество графики|Graphics quality|Grafikqualität|画质
Разрешение рендера и детализация теней.|Render resolution and shadow detail.|Renderauflösung und Schattendetails.|渲染分辨率与阴影细节。
Тени|Shadows|Schatten|阴影
Динамические тени от зданий, деревьев и рельефа.|Dynamic shadows from buildings, trees and terrain.|Dynamische Schatten von Gebäuden, Bäumen und Gelände.|建筑、树木与地形的动态阴影。
Движение воды|Water motion|Wasserbewegung|水面动态
Анимация крупных волн и шейдерной ряби.|Animation of large waves and surface ripples.|Animation großer Wellen und feiner Wasserbewegungen.|大波浪与水面涟漪动画。
Чувствительность камеры|Camera sensitivity|Kameraempfindlichkeit|镜头灵敏度
Скорость вращения, панорамирования и зума.|Rotation, panning and zoom speed.|Geschwindigkeit für Drehung, Verschiebung und Zoom.|旋转、平移与缩放速度。
Музыка / атмосфера|Music / ambience|Musik / Atmosphäre|音乐／环境音
Громкость спокойного фонового ambience.|Volume of the calm background ambience.|Lautstärke der ruhigen Hintergrundatmosphäre.|宁静背景环境音的音量。
Звуки интерфейса|Interface sounds|Oberflächentöne|界面音效
Клики кнопок, карточек и элементов меню.|Clicks on buttons, cards and menu items.|Klicks auf Schaltflächen, Karten und Menüpunkte.|按钮、卡牌与菜单的点击音效。
LOW|LOW|NIEDRIG|低
MED|MEDIUM|MITTEL|中
HIGH|HIGH|HOCH|高
Пауза|Pause|Pause|暂停
Главное меню|Main menu|Hauptmenü|主菜单
Начать заново|Restart|Neu starten|重新开始
БЫСТРЫЕ НАСТРОЙКИ|QUICK SETTINGS|SCHNELLEINSTELLUNGEN|快捷设置
ESC — НАЗАД|ESC — BACK|ESC — ZURÜCK|ESC — 返回
Начать новую игру? Текущее сохранение будет удалено.|Start a new game? The current save will be deleted.|Neues Spiel starten? Der aktuelle Spielstand wird gelöscht.|开始新游戏？当前存档将被删除。
Начать эту партию заново? Текущее сохранение будет удалено.|Restart this run? The current save will be deleted.|Diese Partie neu starten? Der aktuelle Spielstand wird gelöscht.|重新开始本局？当前存档将被删除。
Морская экспедиция|Sea expedition|Seeexpedition|海上探险
Куда отправить лодку?|Where should the boat go?|Wohin soll das Boot fahren?|让小船驶向何方？
Первый причал открывает морскую ветку. Выберите, чем станет первая экспедиция.|Your first pier unlocks maritime development. Choose your first expedition.|Der erste Anleger eröffnet die Seefahrt. Wähle deine erste Expedition.|首个码头解锁海上发展。选择第一次探险的方向。
Исследовать архипелаг|Explore the archipelago|Archipel erkunden|探索群岛
Сразу получить|Receive immediately|Sofort erhalten|立即获得
7 фрагментов территории|7 land fragments|7 Landstücke|7 块领土
разных форм и быстро расшириться в море.|of different shapes and expand quickly across the sea.|in verschiedenen Formen und schnell ins Meer expandieren.|，形状各异，快速向海上扩张。
+7 ФРАГМЕНТОВ ТЕРРИТОРИИ|+7 LAND FRAGMENTS|+7 LANDSTÜCKE|+7 块领土
Зажечь огонь вдали|Light a distant beacon|Fernes Leuchtfeuer entzünden|点亮远方灯塔
Получить маяк, основать дальнюю точку и строить новые фрагменты острова вокруг неё.|Receive a lighthouse, establish a distant outpost and build island fragments around it.|Erhalte einen Leuchtturm, gründe einen fernen Außenposten und baue darum neue Landstücke.|获得灯塔，建立远方据点，并在周围放置新岛屿地块。
+1 МАЯК · +2 ФРАГМЕНТА|+1 LIGHTHOUSE · +2 FRAGMENTS|+1 LEUCHTTURM · +2 LANDSTÜCKE|+1 灯塔 · +2 地块
Портовый склад откроется при любом выборе.|The port warehouse unlocks with either choice.|Das Hafenlager wird bei beiden Optionen freigeschaltet.|无论选择哪项都会解锁港口仓库。
Очки|Score|Punkte|得分
Древесина|Wood|Holz|木材
Камень|Stone|Stein|石材
Комбо|Combos|Kombos|连锁
Земля|Land|Land|土地
Цель|Goal|Ziel|目标
Рука карт|Card hand|Kartenhand|手牌
Рука|Hand|Hand|手牌
Запас карт|Card reserve|Kartenreserve|备用卡牌
Запас пуст|Reserve empty|Reserve leer|备用牌为空
Запас: |Reserve: |Reserve: |备用牌：
Запас|Reserve|Reserve|备用牌
Объект|Object|Objekt|对象
Выберите карту|Choose a card|Karte wählen|选择卡牌
Соединяйте любые 4 части поля|Connect any 4 field tiles|Verbinde 4 beliebige Feldstücke|连接任意 4 块农田
Форма не важна: линия, угол, зигзаг — без мельницы 4 связанные части схлопываются в самую первую.|Any shape works: line, corner or zigzag. Without a windmill, 4 connected fields merge into the first one.|Jede Form zählt: Linie, Ecke oder Zickzack. Ohne Windmühle verschmelzen 4 verbundene Felder zum ersten.|形状不限：直线、转角或折线。没有风车时，4 块相连农田会合并到最先放置的一块。
Первое комбо|First combo|Erste Kombo|首次连锁
Ферма|Farming|Landwirtschaft|农业
Море|Sea|Meer|海洋
Ландшафт|Landscape|Landschaft|地形
Навигация|Navigation|Navigation|航海
Порт|Port|Hafen|港口
Природа|Nature|Natur|自然
Инструмент|Tool|Werkzeug|工具
Постройка|Building|Gebäude|建筑
Поселение|Settlement|Siedlung|聚落
Торговля|Trade|Handel|贸易
Производство|Production|Produktion|生产
Поле|Field|Feld|农田
Причал|Pier|Anleger|码头
Расширение территории|Land expansion|Landerweiterung|领土扩张
Маяк|Lighthouse|Leuchtturm|灯塔
Портовый склад|Port warehouse|Hafenlager|港口仓库
Посадить лес|Plant forest|Wald pflanzen|种植森林
Камни|Rocks|Felsen|岩石
Бульдозер|Bulldozer|Planierraupe|推土机
Мельница|Windmill|Windmühle|风车
Дом|House|Haus|房屋
Рынок|Market|Markt|市场
Лесопилка|Sawmill|Sägewerk|锯木厂
Каменоломня|Quarry|Steinbruch|采石场
Добавить часть поля. Вся связная группа растёт от 1 до 4 стадии; четыре части образуют комбо.|Add a field tile. Connected fields grow from stage 1 to 4; four tiles form a combo.|Füge ein Feldstück hinzu. Verbundene Felder wachsen von Stufe 1 bis 4; vier Stücke bilden eine Kombo.|增加一块农田。相连农田从第 1 阶段成长到第 4 阶段；四块组成连锁。
Ставится на воду у берега. Открывается через развитие деревообработки и запускает морскую ветку.|Place on water by the shore. Wood production unlocks it and opens maritime development.|Wird am Ufer auf Wasser gebaut. Holzproduktion schaltet ihn frei und eröffnet die Seefahrt.|放置在岸边水面。通过木材生产解锁，开启海上发展。
Бесплатный фрагмент острова заданной формы. На карте заранее видно лес и камни; перед установкой фрагмент можно вращать Q/E.|A free island fragment with a fixed shape. Forests and rocks are shown in advance; rotate with Q/E before placing.|Kostenloses Inselstück mit fester Form. Wald und Felsen sind vorher sichtbar; vor dem Platzieren mit Q/E drehen.|免费的固定形状岛屿地块。卡牌会提前显示森林与岩石；放置前可用 Q/E 旋转。
Особая карта морской экспедиции. Ставится на сушу или создаёт собственный остров вдали.|A special expedition card. Place on land or establish a distant island.|Besondere Expeditionskarte. Auf Land platzieren oder eine ferne Insel gründen.|海上探险的特殊卡牌。可放在陆地上，或在远方创建独立岛屿。
Заменяет оставшиеся карты в руке другими случайными. Количество карт сохраняется; запас не увеличивается.|Replace the remaining hand with different random cards. Card count stays the same; no extra reserve.|Ersetzt die übrigen Handkarten durch andere zufällige Karten. Die Anzahl bleibt gleich; die Reserve wächst nicht.|将剩余手牌换成其他随机卡牌。数量不变，不增加备用牌。
Базовая карта мира. Лесопилка даёт древесину за 1-ю обработку и вырубает дерево за 2-ю.|Basic world card. A sawmill yields wood on the first pass and clears the forest on the second.|Grundlegende Weltkarte. Das Sägewerk liefert beim ersten Durchgang Holz und rodet beim zweiten.|基础世界卡牌。锯木厂第一次加工获得木材，第二次清除森林。
Базовая карта мира. Каменоломня даёт камень за 1-ю обработку и истощает залежь за 2-ю.|Basic world card. A quarry yields stone on the first pass and exhausts the deposit on the second.|Grundlegende Weltkarte. Der Steinbruch liefert zuerst Stein und erschöpft das Vorkommen beim zweiten Durchgang.|基础世界卡牌。采石场第一次加工获得石材，第二次耗尽矿藏。
Сносит выбранную постройку, причал, поле, лес или камни. Острова и маяки сохраняются; ресурсы не возвращаются.|Demolish a building, pier, field, forest or rocks. Islands and lighthouses remain; resources are not refunded.|Reißt Gebäude, Anleger, Felder, Wald oder Felsen ab. Inseln und Leuchttürme bleiben; keine Ressourcenerstattung.|拆除建筑、码头、农田、森林或岩石。保留岛屿与灯塔，不返还资源。
До 4 связанных полей с каждой стороны, всего 16. Замените мельницу новой картой, чтобы собрать поля и получить бонус.|Up to 4 connected fields on each side, 16 total. Replace the windmill with a new card to harvest and earn a bonus.|Bis zu 4 verbundene Felder je Seite, insgesamt 16. Ersetze die Windmühle mit einer neuen Karte, um zu ernten und einen Bonus zu erhalten.|每侧最多 4 块相连农田，总计 16 块。使用新风车卡替换风车以收获并获得奖励。
Базовая карта развития. Жилой дом усиливает рынок, построенный рядом.|Basic development card. Houses strengthen a nearby market.|Grundlegende Entwicklungskarte. Häuser stärken einen benachbarten Markt.|基础发展卡牌。住宅可以强化附近市场。
Открывается первым связным комбо из 6 домов. Даёт больше очков за соседние дома.|Unlocked by the first combo of 6 connected houses. Scores more for adjacent houses.|Die erste Kombo aus 6 verbundenen Häusern schaltet ihn frei. Mehr Punkte für benachbarte Häuser.|首次连接 6 栋房屋形成连锁后解锁。相邻房屋越多，得分越高。
Базовая карта развития. Обрабатывает соседний лес; повторная обработка завершает вырубку.|Basic development card. Process adjacent forest; a second pass completes logging.|Grundlegende Entwicklungskarte. Verarbeitet angrenzenden Wald; der zweite Durchgang beendet die Rodung.|基础发展卡牌。加工邻近森林；第二次加工完成砍伐。
Базовая карта развития. Обрабатывает соседние камни; повторная обработка завершает добычу.|Basic development card. Process adjacent rocks; a second pass completes mining.|Grundlegende Entwicklungskarte. Verarbeitet angrenzende Felsen; der zweite Durchgang beendet den Abbau.|基础发展卡牌。加工邻近岩石；第二次加工完成开采。
Бесплатно|Free|Kostenlos|免费
Карта|Card|Karte|卡牌
ВЫБРАТЬ · Q/E ПОВОРОТ|SELECT · Q/E ROTATE|WÄHLEN · Q/E DREHEN|选择 · Q/E 旋转
Выбрать|Select|Wählen|选择
Нужны ресурсы|Resources needed|Ressourcen fehlen|需要资源
Не хватает ресурсов для этой карты.|Not enough resources for this card.|Nicht genug Ressourcen für diese Karte.|没有足够资源使用此卡。
Не хватает ресурсов для установки.|Not enough resources to place this.|Nicht genug Ressourcen zum Platzieren.|没有足够资源进行放置。
Фрагмент |Fragment |Landstück |地块 
 · Q/E — повернуть| · Q/E — rotate| · Q/E — drehen| · Q/E — 旋转
Север|North|Norden|北
Восток|East|Osten|东
Юг|South|Süden|南
Запад|West|Westen|西
Свободная земля|Empty land|Freies Land|空地
Лес|Forest|Wald|森林
лес ×|forest ×|Wald ×|森林 ×
камни ×|rocks ×|Felsen ×|岩石 ×
клетка|tile|Feld|格
клетки|tiles|Felder|格
клеток|tiles|Felder|格
карт|cards|Karten|张卡牌
кл.|tiles|Felder|格
часть|tile|Teil|块
части|tiles|Teile|块
 · пустой| · empty| · leer| · 空
древесины|wood|Holz|木材
камня|stone|Stein|石材
внутренняя|interior|Innenbereich|内部
берег|shore|Ufer|海岸
внешний угол|outer corner|Außenecke|外角
внутренний угол|inner corner|Innenecke|内角
пролив|channel|Kanal|海峡
полуостров|peninsula|Halbinsel|半岛
отдельный островок|separate islet|einzelne kleine Insel|独立小岛
остров|island|Insel|岛屿
Севооборот|Crop rotation|Fruchtfolge|轮作
Лесовосстановление|Reforestation|Wiederaufforstung|森林恢复
Торговые договоры|Trade agreements|Handelsabkommen|贸易协议
Картография|Cartography|Kartografie|制图学
После урожая мельницы одно поле остаётся для следующего цикла.|After the windmill harvest, one field remains for the next cycle.|Nach der Windmühlenernte bleibt ein Feld für den nächsten Zyklus.|风车收获后保留一块农田用于下一轮。
После истощения каждой клетки леса вы получаете карту нового леса.|Receive a new forest card for each exhausted forest tile.|Für jedes erschöpfte Waldfeld erhältst du eine neue Waldkarte.|每耗尽一格森林，获得一张新森林卡。
На рынке обменяйте 3 карты из руки на одну из трёх предложенных.|At a market, trade 3 hand cards for one of 3 offered cards.|Tausche am Markt 3 Handkarten gegen eine von 3 angebotenen Karten.|在市场将 3 张手牌换成三张备选卡中的一张。
Перед размещением карты острова выберите один из трёх фрагментов.|Choose one of 3 fragments before placing an island card.|Wähle vor dem Platzieren einer Inselkarte eines von 3 Landstücken.|放置岛屿卡前，从三个地块中选择一个。
Дальность строительства вокруг маяка увеличивается с 3 до 5 клеток.|Lighthouse building range increases from 3 to 5 tiles.|Die Baureichweite um Leuchttürme steigt von 3 auf 5 Felder.|灯塔周围的建造范围从 3 格提升至 5 格。
Исследования|Research|Forschung|研究
Выберите новое исследование|Choose new research|Neue Forschung wählen|选择新研究
Изучено: |Researched: |Erforscht: |已研究：
Картография: выберите остров|Cartography: choose an island|Kartografie: Insel wählen|制图学：选择岛屿
Для обмена нужны рынок, исследование и 3 карты в руке.|Trading requires a market, research and 3 cards in hand.|Zum Tauschen brauchst du einen Markt, die Forschung und 3 Handkarten.|交易需要市场、对应研究和 3 张手牌。
Выберите три карты для обмена|Choose three cards to trade|Drei Karten zum Tauschen wählen|选择三张用于交易的卡牌
Выберите 3 ненужные карты|Choose 3 cards to trade|Wähle 3 Karten zum Tauschen|选择 3 张不需要的卡牌
Обменять 3 карты|Trade 3 cards|3 Karten tauschen|交换 3 张卡牌
Обменять карты|Trade cards|Karten tauschen|交换卡牌
Отмена|Cancel|Abbrechen|取消
Сейчас нет доступных карт для обмена.|No cards are currently available for trade.|Derzeit sind keine Karten zum Tauschen verfügbar.|当前没有可供交易的卡牌。
Выберите карту взамен|Choose a replacement card|Ersatzkarte wählen|选择换入的卡牌
Три карты обменяны на одну выбранную.|Three cards traded for your chosen card.|Drei Karten gegen die gewählte Karte getauscht.|已将三张卡换成所选的一张卡。
Исследования города|City research|Stadtforschung|城市研究
Знания этой партии|Knowledge this run|Wissen dieser Partie|本局知识
Выбор после 1, 3, 6 и 10 комбо, а также первого морского маршрута.|Choose after 1, 3, 6 and 10 combos, and your first sea route.|Wähle nach 1, 3, 6 und 10 Kombos sowie der ersten Seeroute.|完成 1、3、6、10 次连锁及首条海上航线后可选择研究。
Не изучено|Not researched|Nicht erforscht|未研究
Изучено|Researched|Erforscht|已研究
Вернуться к городу|Return to city|Zur Stadt zurück|返回城市
Деревня|Village|Dorf|村庄
Городок|Town|Kleinstadt|小镇
Город|City|Stadt|城市
Островная столица|Island capital|Inselhauptstadt|岛屿首都
Столица|Capital|Hauptstadt|首都
Дома|Houses|Häuser|房屋
Открыть мельницу|Unlock the windmill|Windmühle freischalten|解锁风车
Открыть рынок|Unlock the market|Markt freischalten|解锁市场
Большой урожай|Large harvest|Große Ernte|丰收
Запустить производство|Start production|Produktion starten|启动生产
Построить рынок|Build a market|Markt bauen|建造市场
Большие урожаи|Large harvests|Große Ernten|丰收次数
Добывать древесину|Produce wood|Holz gewinnen|生产木材
Добывать камень|Produce stone|Stein gewinnen|生产石材
Причалы|Piers|Anleger|码头
Морские маршруты|Sea routes|Seerouten|海上航线
Статус города|City rank|Stadtrang|城市等级
Новый статус|New rank|Neuer Rang|新等级
Результат забега|Run result|Partieergebnis|本局结果
Небольшой берег превратился в самостоятельный город. Итоги этой партии сохранены — можно продолжить развитие или начать новый остров.|A small shore has become a thriving city. Your results are saved: continue building or start a new island.|Ein kleines Ufer wurde zur eigenständigen Stadt. Das Ergebnis ist gespeichert: weiterbauen oder eine neue Insel beginnen.|小小海岸已发展为独立城市。本局结果已保存：可以继续建设或开始新岛屿。
Продолжить строительство|Continue building|Weiterbauen|继续建设
Новый забег|New run|Neue Partie|新一局
Максимальный статус достигнут. Город можно продолжать развивать без ограничений.|Maximum rank reached. You can keep developing the city.|Höchster Rang erreicht. Du kannst die Stadt weiterentwickeln.|已达到最高等级，可以继续发展城市。
Островная столица построена|Island capital built|Inselhauptstadt errichtet|岛屿首都已建成
Следующий статус — |Next rank — |Nächster Rang — |下一等级 — 
. Выполните все условия:|. Complete every requirement:|. Erfülle alle Bedingungen:|。完成所有条件：
Итоговый счёт|Final score|Endpunktzahl|最终得分
Размер острова|Island size|Inselgröße|岛屿大小
клеток земли|land tiles|Landfelder|格土地
Дома / районы|Houses / districts|Häuser / Viertel|房屋／街区
Добыто древесины|Wood produced|Holz gewonnen|木材产量
Добыто камня|Stone produced|Stein gewonnen|石材产量
+1 фрагмент территории · +1 поле|+1 land fragment · +1 field|+1 Landstück · +1 Feld|+1 领土地块 · +1 农田
+2 фрагмента территории · +1 дом|+2 land fragments · +1 house|+2 Landstücke · +1 Haus|+2 领土地块 · +1 房屋
+1 маяк · +2 фрагмента территории|+1 lighthouse · +2 land fragments|+1 Leuchtturm · +2 Landstücke|+1 灯塔 · +2 领土地块
+3 фрагмента территории · +2 поля|+3 land fragments · +2 fields|+3 Landstücke · +2 Felder|+3 领土地块 · +2 农田
Партия завершена|Run ended|Partie beendet|本局结束
Новая партия|New game|Neues Spiel|新游戏
Начать с нового острова и запаса из 24 карт.|Start with a new island and a deck of 24 cards.|Beginne mit einer neuen Insel und 24 Karten.|从新岛屿与 24 张卡牌开始。
Посмотреть результат и выбрать новую партию.|Review your result and choose a new run.|Ergebnis ansehen und neue Partie wählen.|查看结果并选择新一局。
Нет доступных ходов|No moves available|Keine Züge möglich|无可用行动
Карты закончились|Out of cards|Keine Karten mehr|卡牌耗尽
Результат: |Result: |Ergebnis: |结果：
 очков, | points, | Punkte, | 分，
 комбо. | combos. | Kombos. | 次连锁。
Для оставшихся карт не хватает ресурсов или подходящих мест.|Not enough resources or suitable locations for the remaining cards.|Für die übrigen Karten fehlen Ressourcen oder geeignete Plätze.|剩余卡牌缺少资源或合适的放置位置。
Ни в руке, ни в запасе не осталось карт. Комбо и открытия — источник новых карт.|No cards remain in hand or reserve. Combos and discoveries provide new cards.|Keine Karten in Hand oder Reserve. Kombos und Entdeckungen liefern neue Karten.|手牌与备用牌均已耗尽。连锁与解锁是新卡牌的来源。
Сохранение загружено. Продолжаем строительство.|Save loaded. Let's keep building.|Spielstand geladen. Wir bauen weiter.|存档已加载，继续建设。
Новая партия начата. Автосохранение включено.|New game started. Autosave enabled.|Neue Partie gestartet. Automatisches Speichern aktiv.|新游戏已开始，自动保存已开启。
Сохранение оказалось повреждено. Начата новая партия.|The save was corrupted. A new game has started.|Der Spielstand war beschädigt. Eine neue Partie wurde gestartet.|存档已损坏，已开始新游戏。
ССЫЛКА СКОПИРОВАНА|LINK COPIED|LINK KOPIERT|链接已复制
НЕ УДАЛОСЬ СКОПИРОВАТЬ|COPY FAILED|KOPIEREN FEHLGESCHLAGEN|复制失败
SEED ПАРТИИ|RUN SEED|PARTIE-SEED|本局种子
SEED ЭТОГО ЗАБЕГА|THIS RUN'S SEED|SEED DIESER PARTIE|本局种子
КОПИРОВАТЬ ССЫЛКУ|COPY LINK|LINK KOPIEREN|复制链接
Повторить этот seed|Replay this seed|Diesen Seed wiederholen|重玩此种子
Зелёный берег|Verdant shore|Grünes Ufer|翠绿海岸
Больше леса и лесопилок. Глубокая зелень и прохладные скалы.|More forests and sawmills. Deep greens and cool cliffs.|Mehr Wald und Sägewerke. Tiefes Grün und kühle Felsen.|更多森林与锯木厂，浓绿植被与冷色岩壁。
+ лес · + лесопилки|+ forests · + sawmills|+ Wald · + Sägewerke|+ 森林 · + 锯木厂
Каменные гряды|Rocky highlands|Felsige Höhen|岩石高地
Чаще встречаются камни и каменоломни. Сдержанная высокогорная палитра.|More rocks and quarries. A muted highland palette.|Mehr Felsen und Steinbrüche. Zurückhaltende Hochlandfarben.|更多岩石与采石场，采用柔和的高地配色。
+ камни · + каменоломни|+ rocks · + quarries|+ Felsen · + Steinbrüche|+ 岩石 · + 采石场
Золотые низины|Golden lowlands|Goldene Niederungen|金色低地
Больше полей и домов. Тёплая трава и солнечный берег.|More fields and houses. Warm grass and sunny shores.|Mehr Felder und Häuser. Warmes Gras und sonnige Ufer.|更多农田与房屋，暖色草地与阳光海岸。
+ поля · + дома|+ fields · + houses|+ Felder · + Häuser|+ 农田 · + 房屋
Ветреный архипелаг|Windy archipelago|Windiger Archipel|风之群岛
Чаще приходят расширения территории и уже открытые морские карты. Более холодный островной тон.|More land expansions and unlocked sea cards. Cooler island tones.|Mehr Landerweiterungen und freigeschaltete Seekarten. Kühlere Inselfarben.|更多领土扩张与已解锁海洋卡牌，岛屿色调更冷。
+ территории · + море|+ land · + sea|+ Land · + Meer|+ 领土 · + 海洋
БИОМ ОСТРОВА|ISLAND BIOME|INSELBIOM|岛屿生态
БИОМ ЗАБЕГА|RUN BIOME|PARTIEBIOM|本局生态
`;
rows+=`\n
Поднимаем остров из воды|Raising the island from the sea|Insel aus dem Meer heben|从海中升起岛屿
Собираем берег по кусочкам|Putting the shore together|Ufer Stück für Stück zusammensetzen|拼接海岸
Укладываем свежий дёрн|Laying fresh turf|Frischen Rasen verlegen|铺设新草皮
Расставляем камни у воды|Placing rocks by the water|Felsen am Wasser platzieren|在水边放置岩石
Сажаем первые деревья|Planting the first trees|Erste Bäume pflanzen|种下第一批树木
Разравниваем землю под поля|Leveling land for fields|Land für Felder ebnen|平整农田土地
Проверяем, не уплыл ли остров|Checking the island hasn't drifted away|Prüfen, ob die Insel noch da ist|检查岛屿是否漂走了
Готовим место для будущих построек|Preparing building sites|Bauplätze vorbereiten|准备未来建筑的位置
Перемешиваем колоду|Shuffling the deck|Karten mischen|洗牌中
Прячем лишние карты в запас|Stacking extra cards in reserve|Zusätzliche Karten in die Reserve legen|将多余卡牌放入备用牌
Разгоняем ветер над полями|Bringing wind to the fields|Wind über die Felder schicken|让风吹过农田
Проверяем стыки берегов|Checking coastline connections|Uferverbindungen prüfen|检查海岸连接
Добавляем траву по краям|Adding grass along the edges|Gras an den Rändern pflanzen|在边缘添加草地
Будим остров|Waking the island|Insel wecken|唤醒岛屿
Последний штрих…|One final touch…|Der letzte Schliff…|最后的润色……
Подготавливаем мельницу|Preparing the windmill|Windmühle vorbereiten|准备风车
Поднимаем башню маяка|Raising the lighthouse tower|Leuchtturm errichten|建起灯塔
Высаживаем первые деревья|Planting the first trees|Erste Bäume pflanzen|种下第一批树木
Добавляем лесу разнообразия|Adding variety to the forest|Wald abwechslungsreicher gestalten|丰富森林种类
Раскладываем камни у воды|Arranging rocks by the water|Felsen am Wasser verteilen|在水边布置岩石
Формируем каменистый берег|Shaping the rocky shore|Felsiges Ufer formen|塑造岩石海岸
Готовим будущие дома|Preparing the houses|Häuser vorbereiten|准备房屋
Собираем рыночную площадь|Building the market square|Marktplatz gestalten|建造市场广场
Подвозим брёвна к лесопилке|Bringing logs to the sawmill|Stämme zum Sägewerk bringen|将原木送往锯木厂
Готовим каменоломню|Preparing the quarry|Steinbruch vorbereiten|准备采石场
Готовим молодые посевы|Preparing fresh crops|Junge Saat vorbereiten|准备新作物
Поднимаем первые ростки|Growing the first sprouts|Erste Sprossen wachsen lassen|长出第一批幼苗
Выращиваем поля|Growing the fields|Felder wachsen lassen|培育农田
Доводим урожай до зрелости|Ripening the harvest|Ernte reifen lassen|让作物成熟
Собираем причалы|Building the piers|Anleger bauen|建造码头
Соединяем порт с берегом|Connecting the port to shore|Hafen mit dem Ufer verbinden|连接港口与海岸
Обустраиваем порт|Fitting out the port|Hafen ausstatten|布置港口
Ставим портовые постройки|Placing port buildings|Hafengebäude platzieren|放置港口建筑
Готовим портовый склад|Preparing the port warehouse|Hafenlager vorbereiten|准备港口仓库
Добавляем дома|Adding houses|Häuser hinzufügen|添加房屋
Разнообразим жилой квартал|Adding variety to the neighborhood|Wohnviertel abwechslungsreicher gestalten|丰富住宅区
Завершаем жилой квартал|Finishing the neighborhood|Wohnviertel fertigstellen|完成住宅区
Добавляем каменные залежи|Adding stone deposits|Steinvorkommen hinzufügen|添加石材矿藏
Мир готов|World ready|Welt bereit|世界已就绪
Всё на своих местах|Everything is in place|Alles ist an seinem Platz|一切已准备就绪
Остров готов.|Island ready.|Insel bereit.|岛屿已就绪。
Готовим колоду|Preparing the deck|Kartenstapel vorbereiten|准备牌组
Рисуем карточки|Drawing the cards|Karten zeichnen|绘制卡牌
Раскладываем карты по местам|Putting the cards in place|Karten verteilen|布置卡牌
Последняя проверка|Final check|Letzte Prüfung|最后检查
Строим мир|Building the world|Welt aufbauen|构建世界
Подготавливаем мир|Preparing the world|Welt vorbereiten|准备世界
Собираем остров|Assembling the island|Insel zusammensetzen|组装岛屿
Мир собран|World assembled|Welt aufgebaut|世界已构建
Ошибка|Error|Fehler|错误
Не удалось подготовить мир|Could not prepare the world|Welt konnte nicht vorbereitet werden|无法准备世界
Остров не поднялся. Попробуйте обновить страницу.|The island couldn't rise. Try reloading the page.|Die Insel konnte nicht entstehen. Lade die Seite neu.|岛屿未能升起，请尝试刷新页面。
Экспедиция выбрала маяк: +1 маяк, +2 фрагмента территории. Портовый склад тоже открыт.|Expedition chose a lighthouse: +1 lighthouse, +2 land fragments. Port warehouse unlocked too.|Expedition wählt Leuchtturm: +1 Leuchtturm, +2 Landstücke. Hafenlager ebenfalls freigeschaltet.|探险选择了灯塔：+1 灯塔，+2 领土地块。港口仓库也已解锁。
Экспедиция нашла архипелаг: +7 фрагментов территории. Портовый склад тоже открыт.|Expedition found an archipelago: +7 land fragments. Port warehouse unlocked too.|Expedition entdeckt Archipel: +7 Landstücke. Hafenlager ebenfalls freigeschaltet.|探险发现了群岛：+7 领土地块。港口仓库也已解锁。
Морской маршрут между островами! +125 очков и +2 карты.|Sea route between islands! +125 points and +2 cards.|Seeroute zwischen Inseln! +125 Punkte und +2 Karten.|岛屿间海上航线已建立！+125 分和 +2 张卡牌。
Причал ставится на свободную воду вплотную к берегу.|Place a pier on free water directly beside the shore.|Anleger auf freiem Wasser direkt am Ufer platzieren.|码头需放在紧邻海岸的空闲水面。
Причал готов. Лодка ждёт следующую экспедицию.|Pier ready. The boat awaits its next expedition.|Anleger fertig. Das Boot wartet auf die nächste Expedition.|码头已就绪，小船等待下一次探险。
Весь фрагмент должен помещаться на свободной воде и касаться суши либо целиком находиться в радиусе маяка.|The whole fragment must fit on free water and touch land, or be entirely within lighthouse range.|Das gesamte Landstück muss auf freies Wasser passen und Land berühren oder vollständig in Leuchtturmreichweite liegen.|整个地块需位于空闲水面并接触陆地，或完全位于灯塔范围内。
Территория расширена|Land expanded|Land erweitert|领土已扩张
Новый остров основан|New island founded|Neue Insel gegründet|新岛屿已建立
фрагмент|fragment|Landstück|地块
Удалённый маяк можно основать не дальше четырёх клеток от известной суши.|A remote lighthouse can be founded within four tiles of known land.|Ein ferner Leuchtturm darf höchstens vier Felder vom bekannten Land entfernt sein.|远方灯塔可建于距离已知陆地不超过四格的位置。
Маяк основан вдали. Радиус строительства: |Remote lighthouse founded. Building radius: |Ferner Leuchtturm gegründet. Bauradius: |远方灯塔已建立。建造半径：
Маяк зажжён. Радиус строительства: |Lighthouse lit. Building radius: |Leuchtturm entzündet. Bauradius: |灯塔已点亮。建造半径：
Морской причал · активных маршрутов: |Sea pier · active routes: |Anleger · aktive Routen: |海上码头 · 活跃航线：
. Лодка связывает этот остров с другими берегами.|. The boat connects this island to other shores.|. Das Boot verbindet diese Insel mit anderen Ufern.|。小船连接此岛与其他海岸。
Морской причал у острова из |Sea pier on an island of |Anleger an einer Insel mit |海上码头所在岛屿面积为 
. Постройте причал на отдельном острове, чтобы открыть маршрут.|. Build a pier on a separate island to open a route.|. Baue einen Anleger auf einer anderen Insel, um eine Route zu öffnen.|。在另一座岛上建造码头以开通航线。
Цикл завершён: истощено |Cycle complete: tiles exhausted: |Zyklus abgeschlossen: erschöpfte Felder: |循环完成：耗尽地格 
 клеток, производство исчезло| tiles, production removed| Felder, Produktion entfernt| 格，生产建筑已移除
 карта| card| Karte| 张卡牌
Производство разобрано, но рядом не осталось подходящего ресурса.|Production removed, but no suitable resource remained nearby.|Produktion abgebaut, aber keine passenden Ressourcen mehr in der Nähe.|生产建筑已拆除，但附近没有合适资源。
Первое комбо из 4 полей! Мельница открыта и добавлена в руку.|First 4-field combo! Windmill unlocked and added to your hand.|Erste Kombo aus 4 Feldern! Windmühle freigeschaltet und auf die Hand genommen.|首次 4 块农田连锁！风车已解锁并加入手牌。
4 части поля схлопнулись в первую: +120 очков и +1 карта.|4 field tiles merged into the first: +120 points and +1 card.|4 Feldstücke zum ersten verschmolzen: +120 Punkte und +1 Karte.|4 块农田已合并至第一块：+120 分和 +1 张卡牌。
Откройте мельницу|Unlock the windmill|Schalte die Windmühle frei|解锁风车
Соедините по стороне любые 4 обычных поля. Первое такое комбо откроет карту мельницы.|Connect any 4 ordinary fields by their sides. The first combo unlocks the windmill card.|Verbinde 4 gewöhnliche Felder über ihre Seiten. Die erste Kombo schaltet die Windmühlenkarte frei.|将任意 4 块普通农田边相连。首次连锁会解锁风车卡。
ЗАКР.|LOCKED|GESPERRT|未解锁
Открыта|Unlocked|Freigeschaltet|已解锁
Постройте мельницу|Build the windmill|Baue die Windmühle|建造风车
Карта мельницы уже открыта. Поставьте её на свободную клетку острова.|The windmill card is unlocked. Place it on a free island tile.|Die Windmühlenkarte ist freigeschaltet. Platziere sie auf einem freien Inselfeld.|风车卡已解锁，将其放在岛屿空地上。
Рынок: 6 домов|Market: 6 houses|Markt: 6 Häuser|市场：6 栋房屋
Откройте рынок|Unlock the market|Schalte den Markt frei|解锁市场
Соберите связную по сторонам группу из 6 домов. Первый такой жилой квартал откроет рынок.|Connect 6 houses by their sides. Your first housing district unlocks the market.|Verbinde 6 Häuser über ihre Seiten. Das erste Wohnviertel schaltet den Markt frei.|将 6 栋房屋边相连。首个住宅区将解锁市场。
Большой урожай готов|Large harvest ready|Große Ernte bereit|丰收已就绪
Расширяйте поля мельницы|Expand the windmill fields|Erweitere die Windmühlenfelder|扩展风车农田
Положите карту «Мельница» на существующую мельницу, чтобы собрать большой урожай.|Place a Windmill card on the existing windmill to collect a large harvest.|Platziere eine Windmühlenkarte auf der bestehenden Windmühle für eine große Ernte.|将风车卡放在已有风车上以收获。
Разместите по 1–4 связанных поля с каждой стороны. Чем больше полей, тем больше бонус при замене мельницы.|Place 1–4 connected fields on each side. More fields give a larger bonus when replacing the windmill.|Platziere 1–4 verbundene Felder je Seite. Mehr Felder geben beim Ersetzen der Windmühle einen größeren Bonus.|每侧放置 1–4 块相连农田。替换风车时，农田越多奖励越高。
Поле у мельницы: стадия |Windmill field: stage |Windmühlenfeld: Stufe |风车农田：阶段 
. Посажено |. Planted: |. Gepflanzt: |。已种植 
/16 полей. Бонус выдаётся при замене мельницы новой картой.|/16 fields. Replace the windmill with a new card to earn the bonus.|/16 Felder. Der Bonus folgt beim Ersetzen der Windmühle mit einer neuen Karte.|/16 块农田。使用新卡替换风车时获得奖励。
Связное поле: |Connected field: |Verbundenes Feld: |相连农田：
. Стадия |. Stage |. Stufe |。阶段 
/4 растёт при добавлении соседнего поля по стороне.|/4 increases when an adjacent field is added.|/4 steigt beim Hinzufügen eines seitlich angrenzenden Felds.|/4，添加边相邻农田可提升。
Торговые договоры: обменяйте 3 карты на одну выбранную.|Trade agreements: trade 3 cards for one of your choice.|Handelsabkommen: tausche 3 Karten gegen eine gewählte.|贸易协议：将 3 张卡换成所选的一张卡。
Маяк открывает строительство в радиусе |Lighthouse allows building within |Leuchtturm ermöglicht Bauen im Radius von |灯塔可在以下半径内建造：
 клеток. Фрагменты можно ставить без соприкосновения с сушей.| tiles. Fragments do not need to touch land.| Feldern. Landstücke müssen kein Land berühren.| 格。地块不必接触陆地。
Портовый склад · домов рядом: |Port warehouse · adjacent houses: |Hafenlager · benachbarte Häuser: |港口仓库 · 相邻房屋：
, причалов рядом: |, adjacent piers: |, benachbarte Anleger: |，相邻码头：
. При постройке склад меняет оставшиеся карты в руке; их количество не увеличивается.|. Building it replaces remaining hand cards without increasing their count.|. Beim Bau ersetzt das Lager die übrigen Handkarten, ohne die Anzahl zu erhöhen.|。建造仓库将更换剩余手牌，但不增加数量。
: обработка |: processing |: Verarbeitung |：加工 
/2. Первая обработка даёт ресурс, вторая освобождает клетку.|/2. First pass gives resources; second frees the tile.|/2. Zuerst gibt es Ressourcen, dann wird das Feld frei.|/2。第一次加工获得资源，第二次腾出地格。
Положите такую же карту поверх постройки, чтобы завершить цикл: истощить соседнее сырьё, получить награду и освободить клетку производства.|Place the same card on the building to complete the cycle: exhaust nearby resources, earn rewards and free the production tile.|Platziere dieselbe Karte auf dem Gebäude, um den Zyklus abzuschließen: Rohstoffe erschöpfen, Belohnung erhalten und das Produktionsfeld freigeben.|将同类卡牌放在建筑上以完成循环：耗尽邻近资源、获得奖励并腾出生产地格。
 · вариант | · variant | · Variante | · 变体 
Клетка |Tile |Feld |地格 
Мельница заменена! Собрано |Windmill replaced! Fields harvested: |Windmühle ersetzt! Geerntete Felder: |风车已替换！收获农田：
 полей, +| fields, +| Felder, +| 块，+
 бонусных карт. Начинайте новый цикл.| bonus cards. Start a new cycle.| Bonuskarten. Beginne einen neuen Zyklus.| 张奖励卡牌。开始新一轮。
Бульдозер не удаляет острова и маяки. Выберите объект для сноса.|Bulldozer cannot remove islands or lighthouses. Choose an object to demolish.|Die Planierraupe entfernt keine Inseln oder Leuchttürme. Wähle ein Objekt zum Abreißen.|推土机无法移除岛屿与灯塔。请选择拆除对象。
Объект снесён. Остров сохранён, ресурсы не возвращаются.|Object demolished. Island preserved; no resource refund.|Objekt abgerissen. Insel erhalten, keine Ressourcenerstattung.|对象已拆除。岛屿保留，不返还资源。
Здесь уже есть поле. Новую карту поставьте на соседнюю свободную клетку.|There is already a field here. Place the new card on an adjacent free tile.|Hier steht bereits ein Feld. Platziere die neue Karte auf einem freien Nachbarfeld.|这里已有农田，请将新卡放在相邻空地。
Сначала расчистите эту клетку.|Clear this tile first.|Räume zuerst dieses Feld.|请先清理此地格。
Поля мельницы: |Windmill fields: |Windmühlenfelder: |风车农田：
/16. Замените мельницу для бонуса или добавьте ещё поля — до 4 с каждой стороны.|/16. Replace the windmill for a bonus or add more fields, up to 4 per side.|/16. Ersetze die Windmühle für den Bonus oder füge Felder hinzu, bis zu 4 je Seite.|/16。替换风车获得奖励，或增加农田，每侧最多 4 块。
/16. Для урожая нужно хотя бы одно поле с каждой стороны.|/16. Harvest requires at least one field on each side.|/16. Für die Ernte brauchst du mindestens ein Feld je Seite.|/16。收获要求每侧至少一块农田。
Первое поле посажено. Добавьте соседнее по стороне, чтобы оно выросло.|First field planted. Add an adjacent field to help it grow.|Erstes Feld gepflanzt. Füge ein seitliches Nachbarfeld hinzu, damit es wächst.|第一块农田已种植，增加边相邻农田使其成长。
/4. Все части выросли до стадии |/4. All tiles grew to stage |/4. Alle Teile wuchsen auf Stufe |/4。所有农田已成长至阶段 
Для леса нужна свободная клетка.|Forest needs a free tile.|Wald braucht ein freies Feld.|森林需要空地。
Лес попал в перекрытие двух лесопилок: древесина добыта, клетка сразу освободилась.|Forest overlaps two sawmills: wood collected, tile cleared immediately.|Wald liegt bei zwei Sägewerken: Holz gewonnen, Feld sofort frei.|森林处于两座锯木厂范围内：木材已采集，地格立即腾空。
Новый лес сразу обработан соседней лесопилкой: +1 древесина, 1/2.|New forest processed by the adjacent sawmill: +1 wood, 1/2.|Neuer Wald vom benachbarten Sägewerk verarbeitet: +1 Holz, 1/2.|新森林立即由邻近锯木厂加工：+1 木材，1/2。
Камни можно добавить только на свободную клетку.|Rocks can only be placed on a free tile.|Felsen können nur auf einem freien Feld platziert werden.|岩石只能放在空地上。
Камни попали в перекрытие двух каменоломен: ресурс добыт, клетка сразу освободилась.|Rocks overlap two quarries: resources collected, tile cleared immediately.|Felsen liegen bei zwei Steinbrüchen: Ressourcen gewonnen, Feld sofort frei.|岩石处于两座采石场范围内：资源已采集，地格立即腾空。
Новые камни сразу обработаны соседней каменоломней: +1 камень, 1/2.|New rocks processed by the adjacent quarry: +1 stone, 1/2.|Neue Felsen vom benachbarten Steinbruch verarbeitet: +1 Stein, 1/2.|新岩石立即由邻近采石场加工：+1 石材，1/2。
Мельница ещё не открыта.|Windmill not unlocked yet.|Windmühle noch nicht freigeschaltet.|风车尚未解锁。
Для мельницы нужна свободная клетка.|Windmill needs a free tile.|Windmühle braucht ein freies Feld.|风车需要空地。
Мельница построена. Размещайте по 1–4 связанных поля с каждой стороны; до 16 всего.|Windmill built. Place 1–4 connected fields on each side, up to 16 total.|Windmühle gebaut. Platziere 1–4 verbundene Felder je Seite, insgesamt bis zu 16.|风车已建成。每侧放置 1–4 块相连农田，总计最多 16 块。
На острове уже есть мельница.|There is already a windmill on the island.|Auf der Insel steht bereits eine Windmühle.|岛上已有风车。
Для бонуса нужно хотя бы одно зрелое поле с каждой из четырёх сторон мельницы.|The bonus requires at least one mature field on each of the windmill's four sides.|Für den Bonus brauchst du mindestens ein reifes Feld an jeder der vier Windmühlenseiten.|奖励要求风车四侧各至少一块成熟农田。
Для маяка нужна свободная клетка суши.|Lighthouse needs a free land tile.|Leuchtturm braucht ein freies Landfeld.|灯塔需要空闲陆地。
Портовому складу нужна свободная клетка суши.|Port warehouse needs a free land tile.|Hafenlager braucht ein freies Landfeld.|港口仓库需要空闲陆地。
Склад обновил |Warehouse replaced |Lager ersetzte |仓库已更换 
 карт в руке. Запас не увеличен. +| hand cards. Reserve unchanged. +| Handkarten. Reserve unverändert. +| 张手牌。备用牌未增加。+
 очков.| points.| Punkte.| 分。
Для здания нужна свободная клетка.|Building needs a free tile.|Gebäude braucht ein freies Feld.|建筑需要空地。
Комбо из 6 связанных домов! Рынок открыт и добавлен в руку.|Combo of 6 connected houses! Market unlocked and added to your hand.|Kombo aus 6 verbundenen Häusern! Markt freigeschaltet und auf die Hand genommen.|6 栋相连房屋连锁！市场已解锁并加入手牌。
Дом построен. Связный квартал: |House built. Connected district: |Haus gebaut. Verbundenes Viertel: |房屋已建成。相连街区：
/6 до открытия рынка.|/6 to unlock the market.|/6 bis zur Marktfreischaltung.|/6，达标解锁市场。
Рынок ещё не открыт.|Market not unlocked yet.|Markt noch nicht freigeschaltet.|市场尚未解锁。
 домов рядом, +| adjacent houses, +| Häuser daneben, +| 栋相邻房屋，+
Лесопилка построена, но рядом пока нет леса.|Sawmill built, but no forest nearby yet.|Sägewerk gebaut, aber noch kein Wald in der Nähe.|锯木厂已建成，但附近暂无森林。
Каменоломня построена, но рядом пока нет камней.|Quarry built, but no rocks nearby yet.|Steinbruch gebaut, aber noch keine Felsen in der Nähe.|采石场已建成，但附近暂无岩石。
Обработано |Processed |Verarbeitet: |已加工 
 клеток; | tiles; | Felder; | 格；
 уже видели второе производство и исчезли.| were processed twice and cleared.| wurden zweimal verarbeitet und entfernt.| 已加工两次并被清除。
Первая обработка: +|First pass: +|Erster Durchgang: +|首次加工：+
. Сырьё помечено 1/2.|. Resources marked 1/2.|. Rohstoffe mit 1/2 markiert.|。资源标记为 1/2。
Эту карту нужно поставить на воду.|Place this card on water.|Platziere diese Karte auf Wasser.|此卡需放在水面上。
Маяк нужно поставить на сушу или в море недалеко от известного берега.|Place a lighthouse on land or at sea near a known shore.|Platziere einen Leuchtturm auf Land oder im Meer nahe dem bekannten Ufer.|灯塔需放在陆地或已知海岸附近海面。
Эту карту нужно применить к клетке острова.|Use this card on an island tile.|Wende diese Karte auf ein Inselfeld an.|此卡需用于岛屿地格。
В партии 24 стартовые карты. Новые карты дают комбо и открытия — берегите запас.|You start with 24 cards. Combos and discoveries provide more: manage your reserve.|Du beginnst mit 24 Karten. Kombos und Entdeckungen liefern neue: schone deine Reserve.|开局有 24 张卡牌。连锁与解锁可获得新卡，请合理使用备用牌。
`;

rows+=`\n
Освойте первое производство ресурсов.|Start your first resource production.|Starte deine erste Ressourcenproduktion.|开始首次资源生产。
Первое производство запущено. Бульдозер сносит объекты, сохраняя острова и маяки.|First production started. Bulldozer removes objects, preserving islands and lighthouses.|Erste Produktion gestartet. Die Planierraupe entfernt Objekte, Inseln und Leuchttürme bleiben.|首次生产已启动。推土机拆除对象，保留岛屿与灯塔。
Развитая деревообработка позволит выйти к морю.|Wood production opens the way to the sea.|Holzverarbeitung eröffnet den Weg zum Meer.|木材加工使你能够向海洋发展。
Получена первая древесина. Поселение научилось строить причалы.|First wood obtained. Your settlement can now build piers.|Erstes Holz gewonnen. Die Siedlung kann nun Anleger bauen.|首次获得木材，聚落学会了建造码头。
Несколько связанных полей могут открыть новую сельскохозяйственную постройку.|Connected fields can unlock a new farm building.|Verbundene Felder können ein neues Landwirtschaftsgebäude freischalten.|相连农田可解锁新的农业建筑。
Комбо из четырёх полей открыло Мельницу.|A four-field combo unlocked the windmill.|Eine Kombo aus vier Feldern schaltete die Windmühle frei.|四块农田连锁已解锁风车。
Развивайте плотный жилой район.|Develop a dense housing district.|Entwickle ein dichtes Wohnviertel.|发展密集住宅区。
Связный квартал из шести домов открыл Рынок.|Six connected houses unlocked the market.|Sechs verbundene Häuser schalteten den Markt frei.|六栋相连房屋已解锁市场。
Сначала поселению нужен настоящий выход к морю.|Your settlement needs access to the sea first.|Die Siedlung braucht zuerst Zugang zum Meer.|聚落首先需要真正的出海口。
Первый причал открыл портовую торговлю и Портовый склад.|The first pier unlocked port trade and the port warehouse.|Der erste Anleger schaltete Hafenhandel und Hafenlager frei.|首个码头已解锁港口贸易与港口仓库。
Особая морская экспедиция может открыть дальнюю навигацию.|A special sea expedition can unlock distant navigation.|Eine besondere Seeexpedition kann Fernnavigation freischalten.|特殊海上探险可解锁远距离航海。
Морская экспедиция открыла Маяк.|Sea expedition unlocked the lighthouse.|Seeexpedition schaltete den Leuchtturm frei.|海上探险已解锁灯塔。
Новая карта открыта|New card unlocked|Neue Karte freigeschaltet|新卡牌已解锁
Базовая|Basic|Grundkarte|基础
Неизвестно|Unknown|Unbekannt|未知
Доступна с первого хода.|Available from the first move.|Ab dem ersten Zug verfügbar.|从第一步即可使用。
Открытия|Discoveries|Entdeckungen|解锁
COREPOLIS · РАЗВИТИЕ|COREPOLIS · DEVELOPMENT|COREPOLIS · ENTWICKLUNG|COREPOLIS · 发展
Открытия города|City discoveries|Stadtentdeckungen|城市解锁
Новые постройки появляются из действий на острове, а не из общего случайного пула.|New buildings unlock through actions on the island rather than a shared random pool.|Neue Gebäude werden durch Inselaktionen statt aus einem gemeinsamen Zufallspool freigeschaltet.|新建筑通过岛屿上的行动解锁，而非直接从随机卡池获取。
Закрыть|Close|Schließen|关闭
Карты мира доступны всегда|World cards are always available|Weltkarten sind immer verfügbar|世界卡牌始终可用
Расширение территории · Лес · Камни|Land expansion · Forest · Rocks|Landerweiterung · Wald · Felsen|领土扩张 · 森林 · 岩石
Фрагмент|Fragment|Landstück|地块
Взять карту|Take card|Karte nehmen|选取卡牌
Бонус развития|Development bonus|Entwicklungsbonus|发展奖励
Можно взять только одну карту. Две остальные будут сброшены.|Take only one card. The other two will be discarded.|Nimm nur eine Karte. Die anderen beiden werden abgelegt.|只能选取一张卡牌，另外两张将被弃置。
Статус «|Rank “|Rang „|等级“
» открыт. Выберите одну из трёх уже открытых карт, которая лучше подходит вашему острову.|” unlocked. Choose one of three unlocked cards that best suits your island.|“ freigeschaltet. Wähle von drei freigeschalteten Karten die beste für deine Insel.|”已解锁。从三张已解锁卡牌中选择最适合岛屿的一张。
Квартет полей|Field quartet|Feldquartett|农田四重奏
Соедините по сторонам 4 части поля в одну связную группу.|Connect 4 field tiles by their sides into one group.|Verbinde 4 Feldstücke über ihre Seiten zu einer Gruppe.|将 4 块农田边相连，组成一组。
+120 очков · +1 карта · открывает Мельницу|+120 points · +1 card · unlocks Windmill|+120 Punkte · +1 Karte · schaltet Windmühle frei|+120 分 · +1 卡牌 · 解锁风车
Найдите способ объединить несколько полей в одно фермерское комбо.|Find a way to connect fields into a farming combo.|Verbinde mehrere Felder zu einer Landwirtschaftskombo.|寻找将多块农田连成农业连锁的方法。
Разместите по 1–4 связанных поля с каждой стороны Мельницы (до 16), затем замените её новой картой «Мельница».|Place 1–4 connected fields on each side of the windmill (up to 16), then replace it with a new Windmill card.|Platziere 1–4 verbundene Felder je Windmühlenseite (bis zu 16), dann ersetze sie mit einer neuen Windmühlenkarte.|风车每侧放置 1–4 块相连农田（最多 16 块），然后用新风车卡替换风车。
1 бонусная карта за поле · до +4 карт за комбо · +1 комбо|1 bonus card per field · up to +4 combo cards · +1 combo|1 Bonuskarte je Feld · bis zu +4 Kombokarten · +1 Kombo|每块农田 1 张奖励卡 · 连锁额外最多 +4 卡 · +1 连锁
Зрелые поля вокруг Мельницы могут запустить новый цикл урожая.|Mature fields around a windmill can start a new harvest cycle.|Reife Felder um die Windmühle können einen neuen Erntezyklus starten.|风车周围的成熟农田可以开启新的收获循环。
Жилой квартал|Housing district|Wohnviertel|住宅区
Соедините по сторонам 6 домов в один связный жилой квартал.|Connect 6 houses by their sides into one district.|Verbinde 6 Häuser über ihre Seiten zu einem Wohnviertel.|将 6 栋房屋边相连组成住宅区。
открывает Рынок и добавляет его карту в колоду|unlocks Market and adds its card to the deck|schaltet den Markt frei und fügt seine Karte zum Stapel hinzu|解锁市场并将市场卡加入牌组
Большая связная группа домов открывает следующую городскую постройку.|A large connected group of houses unlocks the next city building.|Eine große verbundene Häusergruppe schaltet das nächste Stadtgebäude frei.|大型相连住宅群解锁下一种城市建筑。
Рыночная площадь|Market square|Marktplatz|市场广场
Поставьте Рынок так, чтобы рядом с ним было минимум 2 дома.|Place a market beside at least 2 houses.|Platziere einen Markt neben mindestens 2 Häusern.|在至少 2 栋房屋旁建造市场。
45 очков + 45 за каждый соседний дом · при 2+ домах +1 карта|45 points + 45 per adjacent house · +1 card with 2+ houses|45 Punkte + 45 je Nachbarhaus · bei 2+ Häusern +1 Karte|45 分 + 每栋相邻房屋 45 分 · 2 栋以上 +1 卡
Рынок работает лучше внутри плотного жилого района.|Markets work best in dense housing districts.|Märkte arbeiten am besten in dichten Wohnvierteln.|市场在密集住宅区中效果最佳。
Лесная цепочка|Wood chain|Holzkette|木材链
Поставьте Лесопилку рядом с лесом. Повторная обработка того же дерева завершает вырубку.|Place a sawmill beside a forest. A second pass on the same tree completes logging.|Platziere ein Sägewerk neben Wald. Der zweite Durchgang am selben Baum beendet die Rodung.|在森林旁建造锯木厂。对同一树木第二次加工会完成砍伐。
древесина · очки за истощение · до 2 бонусных карт за крупную обработку|wood · points for depletion · up to 2 bonus cards for large processing|Holz · Punkte für Erschöpfung · bis zu 2 Bonuskarten für große Verarbeitung|木材 · 耗尽得分 · 大规模加工最多 2 张奖励卡
Одно дерево можно обработать больше одного раза.|A tree can be processed more than once.|Ein Baum kann mehrfach verarbeitet werden.|同一树木可加工多次。
Каменная цепочка|Stone chain|Steinkette|石材链
Поставьте Каменоломню рядом с камнями. Повторная обработка той же залежи завершает добычу.|Place a quarry beside rocks. A second pass on the same deposit completes mining.|Platziere einen Steinbruch neben Felsen. Der zweite Durchgang am selben Vorkommen beendet den Abbau.|在岩石旁建造采石场。对同一矿藏第二次加工会完成开采。
камень · очки за истощение · до 2 бонусных карт за крупную обработку|stone · points for depletion · up to 2 bonus cards for large processing|Stein · Punkte für Erschöpfung · bis zu 2 Bonuskarten für große Verarbeitung|石材 · 耗尽得分 · 大规模加工最多 2 张奖励卡
Каменные залежи раскрывают награду после повторной добычи.|Stone deposits reveal their reward after repeated mining.|Steinvorkommen geben ihre Belohnung nach erneutem Abbau.|石材矿藏再次开采后会提供奖励。
Морской маршрут|Sea route|Seeroute|海上航线
Развивайте берег и создайте два причала, которые игра сможет связать морским маршрутом.|Develop the coast and build two piers that can be connected by a sea route.|Entwickle das Ufer und baue zwei Anleger, die eine Seeroute verbinden kann.|发展海岸，建造可通过海上航线相连的两个码头。
+125 очков · +2 карты · +1 комбо|+125 points · +2 cards · +1 combo|+125 Punkte · +2 Karten · +1 Kombo|+125 分 · +2 卡牌 · +1 连锁
Несколько причалов могут превратить берег в связанную морскую сеть.|Multiple piers can create a connected sea network.|Mehrere Anleger können ein verbundenes Seefahrtsnetz bilden.|多个码头可形成连通的海上网络。
Портовый квартал|Port district|Hafenviertel|港口区
Поставьте Портовый склад рядом хотя бы с 1 причалом и минимум 2 домами.|Place a port warehouse beside at least 1 pier and 2 houses.|Platziere ein Hafenlager neben mindestens 1 Anleger und 2 Häusern.|在至少 1 个码头和 2 栋房屋旁建造港口仓库。
замена карт в руке · +1 комбо · усиленный счёт за соседние дома и причалы|replace hand cards · +1 combo · more points for adjacent houses and piers|Handkarten ersetzen · +1 Kombo · mehr Punkte für Nachbarhäuser und Anleger|更换手牌 · +1 连锁 · 相邻房屋与码头提供更多得分
Портовый склад особенно силён между портом и жилым районом.|Port warehouses excel between ports and housing districts.|Hafenlager sind zwischen Hafen und Wohnviertel besonders stark.|港口仓库位于港口与住宅区之间时效果最佳。
COREPOLIS · ЗНАНИЯ|COREPOLIS · KNOWLEDGE|COREPOLIS · WISSEN|COREPOLIS · 知识
Энциклопедия комбо|Combo encyclopedia|Kombo-Enzyklopädie|连锁百科
Открывайте реальные игровые сочетания. Найденные рецепты сохраняются между забегами.|Discover gameplay combinations. Found recipes persist between runs.|Entdecke Spielkombinationen. Gefundene Rezepte bleiben zwischen Partien erhalten.|发现游戏连锁组合。已发现配方在各局之间保留。
Открыто|Discovered|Entdeckt|已发现
Точный рецепт скрыт до первого открытия|Exact recipe hidden until discovered|Genaues Rezept bis zur Entdeckung verborgen|首次发现前隐藏具体配方
Рецепт|Recipe|Rezept|配方
Награда|Reward|Belohnung|奖励
Энциклопедия: открыто комбо «|Encyclopedia: combo discovered “|Enzyklopädie: Kombo entdeckt „|百科：发现连锁“
Энциклопедия: открыто новых комбо — |Encyclopedia: new combos discovered — |Enzyklopädie: neue Kombos entdeckt — |百科：新发现连锁 — 
Обучение|Tutorial|Anleitung|教程
ШАГ 1 · КАРТЫ|STEP 1 · CARDS|SCHRITT 1 · KARTEN|第 1 步 · 卡牌
Начните с четырёх базовых карт|Start with four basic cards|Beginne mit vier Grundkarten|从四种基础卡牌开始
Новый остров начинается с Дома, Поля, Лесопилки и Каменоломни. Продвинутые постройки не лежат в общей колоде с первого хода — их нужно открыть действиями на острове.|A new island starts with House, Field, Sawmill and Quarry. Advanced buildings are not in the deck from the first move: unlock them through island actions.|Eine neue Insel beginnt mit Haus, Feld, Sägewerk und Steinbruch. Fortgeschrittene Gebäude sind nicht von Anfang an im Stapel: schalte sie durch Inselaktionen frei.|新岛屿从房屋、农田、锯木厂和采石场开始。高级建筑不会在第一步就出现在牌组中，需要通过岛屿行动解锁。
Карты территории, леса и камней поддерживают развитие мира|Land, forest and rock cards support world development|Land-, Wald- und Felsenkarten unterstützen die Weltentwicklung|领土、森林与岩石卡牌支持世界发展
Лишние карты уходят в запас справа|Extra cards go to the reserve on the right|Zusätzliche Karten gehen in die Reserve rechts|多余卡牌进入右侧备用牌
Открытая карта входит в пул только после выполнения её условия|A card enters the pool only after its unlock condition is met|Eine Karte kommt erst nach Erfüllung ihrer Bedingung in den Pool|满足解锁条件后，卡牌才会进入卡池
ШАГ 2 · ОСТРОВ|STEP 2 · ISLAND|SCHRITT 2 · INSEL|第 2 步 · 岛屿
Расширяйте берег|Expand the coast|Erweitere das Ufer|扩展海岸
Карта территории добавляет целый фрагмент острова. На мини-карте заранее видны форма, лес и камни. Пока фрагмент выбран, Q и E поворачивают его перед установкой.|A land card adds an entire island fragment. The mini-map shows its shape, forests and rocks. While selected, Q and E rotate it before placement.|Eine Landkarte fügt ein ganzes Inselstück hinzu. Die Minikarte zeigt Form, Wald und Felsen. Drehe das ausgewählte Stück vor dem Platzieren mit Q und E.|领土卡添加整块岛屿地块。小地图提前显示形状、森林与岩石。选中后可用 Q 和 E 在放置前旋转。
Зелёный ghost — место подходит|Green preview — valid placement|Grüne Vorschau — gültiger Platz|绿色预览 — 可以放置
Красный ghost — фрагмент пересекается с занятым местом|Red preview — fragment overlaps occupied space|Rote Vorschau — Landstück überlappt belegten Platz|红色预览 — 地块与已有对象重叠
Каждый seed создаёт свой биом и влияет на доступные веса карт|Each seed creates a biome and affects card weights|Jeder Seed erzeugt ein Biom und beeinflusst Kartenwahrscheinlichkeiten|每个种子生成独特生态并影响卡牌权重
ШАГ 3 · ОТКРЫТИЯ|STEP 3 · DISCOVERIES|SCHRITT 3 · ENTDECKUNGEN|第 3 步 · 解锁
Развивайте колоду самим городом|Develop your deck through your city|Entwickle den Stapel durch deine Stadt|通过城市发展牌组
Действия открывают новые типы карт. Четыре связанных поля открывают Мельницу, шесть связанных домов — Рынок, а первая древесина открывает путь к Причалу. Открытия можно посмотреть в паузе.|Actions unlock new cards. Four connected fields unlock Windmill, six connected houses unlock Market, and your first wood unlocks Pier. Review discoveries in the pause menu.|Aktionen schalten neue Karten frei. Vier verbundene Felder bringen die Windmühle, sechs Häuser den Markt, erstes Holz den Anleger. Entdeckungen stehen im Pausenmenü.|行动解锁新卡牌。四块相连农田解锁风车，六栋相连房屋解锁市场，首次获得木材解锁码头。可在暂停菜单查看解锁。
Заблокированная карта вообще не выпадает случайно|Locked cards never appear randomly|Gesperrte Karten erscheinen nie zufällig|未解锁卡牌不会随机出现
Director уменьшает повторы и бесполезные карты|The director reduces repeats and unusable cards|Der Director reduziert Wiederholungen und unbrauchbare Karten|分配系统减少重复与无用卡牌
Новые открытия ведут к следующим веткам развития|New discoveries lead to further development branches|Neue Entdeckungen führen zu weiteren Entwicklungszweigen|新解锁开启后续发展路线
ШАГ 4 · ЦЕЛЬ|STEP 4 · GOAL|SCHRITT 4 · ZIEL|第 4 步 · 目标
Постройте Островную столицу|Build the island capital|Baue die Inselhauptstadt|建造岛屿首都
Панель цели слева показывает путь Поселение → Деревня → Городок → Город → Островная столица. Нужны земля, жильё, производство, фермерство и морская ветка — одного счёта недостаточно.|The goal panel shows Settlement → Village → Town → City → Island capital. You need land, housing, production, farming and sea development; score alone is not enough.|Das Ziel zeigt Siedlung → Dorf → Kleinstadt → Stadt → Inselhauptstadt. Du brauchst Land, Wohnraum, Produktion, Landwirtschaft und Seefahrt; Punkte allein reichen nicht.|左侧目标面板显示聚落 → 村庄 → 小镇 → 城市 → 岛屿首都。需要土地、住宅、生产、农业与海上发展，仅靠得分不够。
На ключевых статусах выбирайте 1 из 3 бонусных карт|At key ranks, choose 1 of 3 bonus cards|Wähle bei wichtigen Rängen 1 von 3 Bonuskarten|达到关键等级时，从 3 张奖励卡中选择 1 张
Прогресс и мир автоматически сохраняются|Progress and world are saved automatically|Fortschritt und Welt werden automatisch gespeichert|进度与世界会自动保存
После столицы можно продолжить строительство|You can keep building after reaching the capital|Nach der Hauptstadt kannst du weiterbauen|建成首都后仍可继续建设
ШАГ 5 · ЗАБЕГ|STEP 5 · RUN|SCHRITT 5 · PARTIE|第 5 步 · 对局
Каждая партия имеет код|Every run has a code|Jede Partie hat einen Code|每局都有代码
Seed задаёт базовую случайность и биом. Одинаковый seed вместе с одинаковыми решениями воспроизводит тот же ход партии. В паузе можно скопировать ссылку, посмотреть биом, Открытия и Энциклопедию комбо.|The seed sets randomness and biome. The same seed with the same decisions reproduces the run. In the pause menu, copy a link and review your biome, discoveries and combo encyclopedia.|Der Seed bestimmt Zufall und Biom. Gleicher Seed mit gleichen Entscheidungen ergibt dieselbe Partie. Im Pausenmenü kannst du den Link kopieren und Biom, Entdeckungen und Kombos ansehen.|种子决定基础随机性与生态。相同种子加上相同决策可复现对局。暂停时可复制链接，查看生态、解锁和连锁百科。
New Run создаёт новый seed|New Run creates a new seed|Neue Partie erzeugt einen neuen Seed|新一局生成新种子
Повтор seed позволяет переиграть ту же основу партии|Replay a seed to retry the same starting conditions|Seed wiederholen für dieselben Startbedingungen|重玩种子可再次体验相同开局
Continue возвращает сохранённый мир и RNG в то же состояние|Continue restores the saved world and random generator state|Fortsetzen stellt Welt und Zufallszustand wieder her|继续游戏恢复存档世界与随机数状态
Пропустить|Skip|Überspringen|跳过
Назад|Back|Zurück|返回
Далее|Next|Weiter|下一步
Начать строить|Start building|Bauen beginnen|开始建设
`;

rows+=`\n
Corepolis — карточная стратегия на островах онлайн|Corepolis — online island card strategy|Corepolis — Insel-Kartenstrategie online|Corepolis — 在线岛屿卡牌策略
Каталог моделей — Corepolis|Model catalog — Corepolis|Modellkatalog — Corepolis|模型目录 — Corepolis
Выбираем здания|Choose buildings|Gebäude wählen|选择建筑
Нажми на модель, чтобы рассмотреть и назначить её постройке.|Click a model to inspect it and assign it to a building.|Klicke auf ein Modell, um es anzusehen und einem Gebäude zuzuweisen.|点击模型查看并将其分配给建筑。
Скопировать выбор|Copy selection|Auswahl kopieren|复制选择
Фильтры|Filters|Filter|筛选
Название файла…|File name…|Dateiname…|文件名……
Поиск модели|Search models|Modelle suchen|搜索模型
Тип модели|Model type|Modelltyp|模型类型
Все типы|All types|Alle Typen|所有类型
Эпоха|Age|Zeitalter|时代
Все эпохи|All ages|Alle Zeitalter|所有时代
Первая эпоха|First age|Erstes Zeitalter|第一时代
Вторая эпоха|Second age|Zweites Zeitalter|第二时代
Уровень|Level|Stufe|等级
Все уровни|All levels|Alle Stufen|所有等级
Выбранные модели|Selected models|Ausgewählte Modelle|已选模型
Список выбранных моделей|Selected model list|Liste ausgewählter Modelle|已选模型列表
Закрыть просмотр|Close preview|Vorschau schließen|关闭预览
Вращение — зажать мышь · Масштаб — колесо · На телефоне — жесты|Rotate — drag · Zoom — wheel · On phones — gestures|Drehen — ziehen · Zoom — Mausrad · Auf Handys — Gesten|旋转 — 拖动 · 缩放 — 滚轮 · 手机 — 手势
Назначение модели|Model assignment|Modellzuweisung|模型分配
Карьер|Quarry|Steinbruch|采石场
Другая постройка|Other building|Anderes Gebäude|其他建筑
Выбрать модель|Select model|Modell wählen|选择模型
Вернуть ракурс|Reset view|Ansicht zurücksetzen|重置视角
Мельницы|Windmills|Windmühlen|风车
Рынки|Markets|Märkte|市场
Шахта|Mine|Mine|矿井
Поля|Fields|Felder|农田
Склады|Warehouses|Lagerhäuser|仓库
Порты|Ports|Häfen|港口
Ратуши|Town halls|Rathäuser|市政厅
Храмы|Temples|Tempel|神殿
Стрельбища|Archery ranges|Bogenschießplätze|射箭场
Казармы|Barracks|Kasernen|兵营
Сторожевые башни|Watchtowers|Wachtürme|瞭望塔
Дома-башни|Tower houses|Turmhäuser|塔楼住宅
Ресурсы|Resources|Ressourcen|资源
Стены|Walls|Mauern|城墙
Башни стен|Wall towers|Mauertürme|城墙塔楼
Монументы|Monuments|Monumente|纪念碑
Стены монументов|Monument walls|Monumentmauern|纪念碑围墙
Горы|Mountains|Berge|山脉
Большая гора|Large mountain|Großer Berg|大型山峰
Ящики|Crates|Kisten|箱子
Бочка|Barrel|Fass|木桶
Брёвна|Logs|Baumstämme|原木
3D-просмотр недоступен: браузер не поддерживает WebGL. Включи аппаратное ускорение или открой каталог в другом браузере.|3D preview unavailable: your browser does not support WebGL. Enable hardware acceleration or use another browser.|3D-Vorschau nicht verfügbar: Der Browser unterstützt kein WebGL. Aktiviere Hardwarebeschleunigung oder nutze einen anderen Browser.|3D 预览不可用：浏览器不支持 WebGL。请开启硬件加速或使用其他浏览器。
Превью не загрузилось — нажми для повторного просмотра|Preview failed — click to retry|Vorschau fehlgeschlagen — zum Wiederholen klicken|预览加载失败 — 点击重试
Загружаем модель…|Loading model…|Modell wird geladen…|正在加载模型……
Выбор по названию доступен; для просмотра модели нужен WebGL.|Select by name; model preview requires WebGL.|Auswahl nach Namen möglich; die Modellvorschau benötigt WebGL.|可按名称选择；模型预览需要 WebGL。
Не удалось загрузить модель. Закрой просмотр и попробуй ещё раз.|Could not load model. Close the preview and try again.|Modell konnte nicht geladen werden. Schließe die Vorschau und versuche es erneut.|无法加载模型。请关闭预览后重试。
Загружаем превью…|Loading preview…|Vorschau wird geladen…|正在加载预览……
Для превью нужен WebGL|Preview requires WebGL|Vorschau benötigt WebGL|预览需要 WebGL
Превью |Preview |Vorschau |预览 
Для 3D-превью нужен WebGL|3D preview requires WebGL|3D-Vorschau benötigt WebGL|3D 预览需要 WebGL
Показано |Showing |Angezeigt: |显示 
 из | of | von |／
 моделей| models| Modelle| 个模型
Убрать из выбора|Remove from selection|Aus Auswahl entfernen|从选择中移除
Сначала открой модель и назначь её постройке.|Open a model and assign it to a building first.|Öffne zuerst ein Modell und weise es einem Gebäude zu.|请先打开模型并将其分配给建筑。
Выбор скопирован. Пришли этот список в чат для подключения моделей.|Selection copied. Send this list in chat to connect the models.|Auswahl kopiert. Sende diese Liste im Chat, um die Modelle einzubinden.|选择已复制。将列表发送到聊天中以接入模型。
Скопируй выделенный список и пришли его в чат.|Copy the selected list and send it in chat.|Kopiere die markierte Liste und sende sie im Chat.|复制选中的列表并发送到聊天中。
 · 3D-превью недоступны: в браузере отключён WebGL.| · 3D previews unavailable: WebGL is disabled.| · 3D-Vorschau nicht verfügbar: WebGL ist deaktiviert.| · 3D 预览不可用：浏览器已禁用 WebGL。
`;

export const messages=rows.trim().split('\n').filter(row=>row.trim()).map(row=>{
  const [source,...translations]=row.split('|');
  if(translations.length!==3)throw new Error('Invalid localization row: '+source);
  return [source,translations];
});
