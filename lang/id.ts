/* eslint-disable no-unused-vars */

import Language from '../lang/langInterface'

/* eslint-enable no-unused-vars */

var id = <Language> {
    // Initial page
    getting_started: 'Mulai',
    create_new: 'Buat wallet baru',
    create_subtext: "Kami akan membuat wallet baru agar anda dapat mulai menggunakan Bitcoin.",
    restore_existing: 'Pulihkan wallet yang ada',
    restore_subtext: "Anda sudah memiliki wallet dan ingin menggunakan kata pemulihan untuk memulihkan.",
    change_language: 'Ubah Bahasa',
    choose_language: 'Pilih Bahasa',

    // Create page
    seed_phrase: "Kata Pemulihan",
    wrote_it_down: 'Saya menuliskan',
    generate: 'Generate',
    warning: 'Peringatan',
    we_will_generate: 'Kami akan generate 12 kata pemulihan untukmu.',
    warning_text_1: "Tuliskan kata itu sesuai urutan yang tepat, simpan, secara offline. Jika kata itu hilang, anda tidak dapat mengakses bitcoin.",
    warning_text_2: "Kata pemulihan ini bisa anda gunakan untuk memulihkan wallet. Tulis dan simpan dengan aman, secara offline.",
    write_it_down: 'Tuliskan',
    keep_it_safe: 'Simpan',
    do_not_lose_it: 'Jangan Sampai Hilang',
    have_saved: 'Saya telah menyimpan kata pemulihan.',

    // Restore page
    restore_notice: 'Masukkan kata pemulihan untuk memulihkan wallet anda.',
    restore_warning: 'Kata pemulihan yang anda masukkan salah. Kata harus dieja tepat dan tidak diawali huruf kapital.',
    restoring: 'Memulihkan...',

    // Wallet home
    refresh: 'Muat ulang',
    overview: 'Tinjauan',
    send: 'Kirim',
    receive: 'Terima',
    settings: 'Pengaturan',
    amount_to_send: 'Jumlah kirim',
    not_enough_balance: 'Saldo tidak cukup untuk mengirim jumlah itu
    send_max: 'Kirim seluruhnya',
    amount: 'Jumlah',
    miner_fee: 'Biaya Jaringan',
    total: 'Total',
    confirmation: 'Konfirmasi',
    they_receive: 'Mereka menerima',
    recepient: 'Penerima',
    sending: 'Mengirimkan...',
    are_you_sure: 'Apa anda yakin untuk mengirimkan transaksi ini?',
    im_sure: "Ya Saya yakin, kirim",
    seed_modal: 'Kata Pemulihan',
    transaction: 'transaksi',
    transactions: 'daftar transaksi',
    buy_bitcoin: 'Beli Bitcoin',

    // Pagination
    page: 'Halaman', // Displayed as 'Page 1 of 1'
    of: 'dari',

    // Overview
    total_balance: "Total Saldo",
    no_transactions: "Anda belum membuat transaksi",
    what_to_do: "Apa yang ingin anda lakukan?",
    date: 'Tanggal',
    status: 'Status',
    processing: 'Memproses',
    unconfirmed: 'Belum terkonfirmasi',
    complete: 'Selesai',

    // Send
    send_to: 'Kirim hanya kepada address Bitcoin (BTC)',
    bitcoin_address: 'Address Bitcoin',
    address: 'Address',
    low_priority: 'Prioritas Rendah',
    standard: 'Standar',
    important: 'Penting',
    low_priority_desc: "Biaya transaksi rendah, namun dengan transaksi prioritas rendah ini anda tidak keberatan menunggu waktu konfirmasi lebih lama.",
    standard_desc: "Menggunakan biaya standar, selama transaksi padat dapat membutuhkan waktu lebih lama, namun ini jarang terjadi.",
    important_desc: "Gunakan biaya premium untuk target konfirmasi selama 30 menit, ini transaksi prioritas tinggi untuk anda yang ingin konfirmasi cepat.",
    not_enough: "Dana tidak mencukupi untuk mengirim jumlah itu beserta biaya jaringan. Coba kirim seluruh saldo dengan menekan tombol Kirim Seluruhnya.",
    dust_error: "Jumlah yang anda kehendaki terlalu kecil untuk proses jaringan Bitcoin.",
    bitcoin_network_fee: "Biaya Jaringan Bitcoin",

    // Receive
    receive_only: 'Terima hanya Bitcoin',
    wallet_address: 'Address wallet',
    address_below: 'pada address di bawah',

    // Settings
    show_seed: 'Pemulihan',
    language: 'Bahasa',
    currency: 'Mata uang',
    exit_wallet: 'Keluar wallet',

    // Buttons
    back_button: 'Kembali',
    restore_button: 'Pulihkan',
    next_button: 'Lanjutkan',
    ok_button: 'OK',
    copy_button: 'Salin',
    save_button: 'Simpan',

    // Notification
    notification_title: 'Transaksi Masuk',

    // Exit wallet
    exit_text: 'Ini akan menghapus file wallet dan seluruh riwayat transaksi anda. Satu-satunya cara untuk memulihkan wallet hanya dengan menggunakan kata pemulihan',
    exit_are_you_sure: 'Apa anda yakin ingin menghapus dan keluar dari wallet ini?',
    exit_label_text: 'Ya, Hapus wallet',
    exit_delete: 'Hapus'
}

export default id
