function formatNumber(num, decimal) { 
    num = parseFloat(num);
    if (num != "" && num != null&&num.toFixed(2) == '0.00') {
    return "";
    }else if (num != "" && num != null) {
        // console.log(num)
        num = parseFloat(num).toFixed(decimal);
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    return "";
}

function setDateTH(date) {
    if (date != '') {
    const months = ['','ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    let d = date.split('-');
    return d[2] + " " + months[parseInt(d[1])] + " " + (parseInt(d[0]) + 543);
    }
    return;
}

function setMonthTH(date) {
    if (date != '') {
    const months = ['','ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    let d = date.split('-');
    return months[parseInt(d[1])] + " " + (parseInt(d[0]) + 543);
    }
    return;
}

module.exports = {
    formatNumber,
    setDateTH,
    setMonthTH
}