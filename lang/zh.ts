/* eslint-disable no-unused-vars */

import Language from '../lang/langInterface'

/* eslint-enable no-unused-vars */

var zh = <Language> {
    // Initial page
    getting_started: '开始',
    create_new: '创建新钱包',
    create_subtext: "我们将为您创建一个新钱包，之后您可以开始使用比特币。",
    restore_existing: '恢复现有钱包',
    restore_subtext: "已经有一个钱包，想用你的恢复词来恢复它。",
    change_language: '改变语言',
    choose_language: '选择语言',

    // Create page
    seed_phrase: "恢复助记词",
    wrote_it_down: '我已经写下来了',
    generate: '生成助记词',
    warning: '提示',
    we_will_generate: '我们将为您生成12个恢复单词。',
    warning_text_1: "把单词按正确的顺序写下来，保持它们的安全，离线。如果丢失这些单词，您将无法访问并使用您的比特币。",
    warning_text_2: "这些恢复词可以让你找回你的钱包。把这些助记词写下来，并保持安全，离线。",
    write_it_down: '写下助记词',
    keep_it_safe: '将它安全储存',
    do_not_lose_it: '别弄丢助记词',
    have_saved: '我已经将助记词放在安全的地方',

    // Restore page
    restore_notice: '请输入您的助记词以恢复您的钱包。',
    restore_warning: '您输入的助记词无效。单词必须拼写正确，没有大写字母。',
    restoring: '恢复中...',

    // Wallet home
    refresh: '刷新',
    overview: '钱包概况',
    send: '发送',
    receive: '接收',
    settings: '设置',
    amount_to_send: '发送数量',
    not_enough_balance: '余额不足，无法发送该金额',
    send_max: '发送最大',
    amount: '数量',
    miner_fee: '网络交易费',
    total: '总共金额',
    confirmation: '确认',
    they_receive: '他们接收',
    recepient: '接收者',
    sending: '发送中...',
    are_you_sure: '确实要发送此交易吗？',
    im_sure: "确定发送",
    seed_modal: '查看助记词',
    transaction: '交易',
    transactions: '所有交易',
    buy_bitcoin: '购买比特币',

    // Pagination
    page: '页数', // Displayed as '页数 1 / 1'
    of: '/',

    // Overview
    total_balance: "总余额",
    no_transactions: "您尚未进行任何交易",
    what_to_do: "想做什么？",
    date: '数据',
    status: '状态',
    processing: '处理中',
    unconfirmed: '未确认',
    complete: '完成',

    // Send
    send_to: '只发送到比特币 (BTC) 地址',
    bitcoin_address: '比特币地址',
    address: '地址',
    low_priority: '经济',
    standard: '常规',
    important: '快速',
    low_priority_desc: "你支付较少的网络交易费，但你认为这是一个低优先级的交易，你不介意可能等待更长时间的确认。",
    standard_desc: "这将使用一个适度的费用，在高拥挤的时候，这可能会导致更长的确认时间，但这种情况是罕见的。",
    important_desc: "使用高昂的网络交易费在30分钟内确认目标，这是一个高优先级的交易以及您希望它快速确认。",
    not_enough: "你没有足够的钱来发送这一数额，同时也支付网络费。尝试用“发送最大值”按钮发送您的全部余额。",
    dust_error: "发送金额太小，比特币区块链网络无法处理。",
    bitcoin_network_fee: "比特币网络交易费",

    // Receive
    receive_only: '只接收比特币',
    wallet_address: '钱包地址',
    address_below: '到下面的地址',

    // Settings
    show_seed: '恢复助记词',
    language: '语言',
    currency: '货币',
    exit_wallet: '退出钱包',

    // Buttons
    back_button: '回退',
    restore_button: '恢复',
    next_button: '下一个',
    ok_button: '确定',
    copy_button: '复制',
    save_button: '保存',

    // Notification
    notification_title: '交易接收中',

    // Exit wallet
    exit_text: '这将销毁您的钱包文件和所有交易记录。恢复钱包的唯一方法就是通过你的助记词',
    exit_are_you_sure: '确定要删除并退出此钱包吗？',
    exit_label_text: '确定删除',
    exit_delete: '删除'
}

export default zh
