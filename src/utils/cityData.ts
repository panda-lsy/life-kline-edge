/**
 * 中国城市数据工具
 * 结合 province-city-china 行政区划数据和城市经纬度数据
 */

import provinceData from 'province-city-china/dist/data.json';

/**
 * 城市经纬度数据（主要城市）
 * 数据来源：公开数据 + 百度地图
 */
const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // 直辖市
  '北京市': { latitude: 39.9042, longitude: 116.4074 },
  '天津市': { latitude: 39.0842, longitude: 117.2010 },
  '上海市': { latitude: 31.2304, longitude: 121.4737 },
  '重庆市': { latitude: 29.4316, longitude: 106.9123 },

  // 河北省
  '石家庄市': { latitude: 38.0428, longitude: 114.5149 },
  '唐山市': { latitude: 39.6294, longitude: 118.1746 },
  '秦皇岛市': { latitude: 39.9354, longitude: 119.5999 },
  '邯郸市': { latitude: 36.6256, longitude: 114.5394 },
  '邢台市': { latitude: 37.0682, longitude: 114.5048 },
  '保定市': { latitude: 38.8738, longitude: 115.4648 },
  '张家口市': { latitude: 40.8118, longitude: 114.8860 },
  '承德市': { latitude: 40.9511, longitude: 117.9636 },
  '沧州市': { latitude: 38.2976, longitude: 116.8388 },
  '廊坊市': { latitude: 39.5237, longitude: 116.6837 },
  '衡水市': { latitude: 37.7355, longitude: 115.6663 },

  // 山西省
  '太原市': { latitude: 37.8706, longitude: 112.5489 },
  '大同市': { latitude: 40.0903, longitude: 113.2951 },
  '阳泉市': { latitude: 37.8576, longitude: 113.5801 },
  '长治市': { latitude: 36.1954, longitude: 113.1162 },
  '晋城市': { latitude: 35.4908, longitude: 112.8513 },
  '朔州市': { latitude: 39.3319, longitude: 112.4328 },
  '晋中市': { latitude: 37.6873, longitude: 112.7527 },
  '运城市': { latitude: 35.0226, longitude: 111.0070 },
  '忻州市': { latitude: 38.4168, longitude: 112.7335 },
  '临汾市': { latitude: 36.0880, longitude: 111.5197 },
  '吕梁市': { latitude: 37.5177, longitude: 111.1348 },

  // 内蒙古自治区
  '呼和浩特市': { latitude: 40.8414, longitude: 111.7519 },
  '包头市': { latitude: 40.6573, longitude: 109.8404 },
  '乌海市': { latitude: 39.6553, longitude: 106.8250 },
  '赤峰市': { latitude: 42.2570, longitude: 118.8869 },
  '通辽市': { latitude: 43.6224, longitude: 122.2631 },
  '鄂尔多斯市': { latitude: 39.6087, longitude: 109.7813 },
  '呼伦贝尔市': { latitude: 49.2153, longitude: 119.7658 },
  '巴彦淖尔市': { latitude: 40.7574, longitude: 107.4165 },
  '乌兰察布市': { latitude: 40.9944, longitude: 113.1324 },
  '兴安盟': { latitude: 46.0763, longitude: 122.0378 },
  '锡林郭勒盟': { latitude: 43.9333, longitude: 116.0420 },
  '阿拉善盟': { latitude: 38.8466, longitude: 105.7334 },

  // 辽宁省
  '沈阳市': { latitude: 41.8057, longitude: 123.4315 },
  '大连市': { latitude: 38.9140, longitude: 121.6147 },
  '鞍山市': { latitude: 41.1107, longitude: 122.9944 },
  '抚顺市': { latitude: 41.8808, longitude: 123.9572 },
  '本溪市': { latitude: 41.2886, longitude: 123.7678 },
  '丹东市': { latitude: 40.1290, longitude: 124.3855 },
  '锦州市': { latitude: 41.0951, longitude: 121.1267 },
  '营口市': { latitude: 40.6675, longitude: 122.2347 },
  '阜新市': { latitude: 42.0118, longitude: 121.6709 },
  '辽阳市': { latitude: 41.2694, longitude: 123.1724 },
  '盘锦市': { latitude: 41.1246, longitude: 122.0707 },
  '铁岭市': { latitude: 42.2936, longitude: 123.8444 },
  '朝阳市': { latitude: 41.5760, longitude: 120.4518 },
  '葫芦岛市': { latitude: 40.7430, longitude: 120.8364 },

  // 吉林省
  '长春市': { latitude: 43.8171, longitude: 125.3235 },
  '吉林市': { latitude: 43.8378, longitude: 126.5497 },
  '四平市': { latitude: 43.1702, longitude: 124.3515 },
  '辽源市': { latitude: 42.9024, longitude: 125.1452 },
  '通化市': { latitude: 41.7285, longitude: 125.9405 },
  '白山市': { latitude: 41.9378, longitude: 126.4169 },
  '松原市': { latitude: 45.1411, longitude: 124.8253 },
  '白城市': { latitude: 45.6197, longitude: 122.8389 },
  '延边朝鲜族自治州': { latitude: 42.8914, longitude: 129.5085 },

  // 黑龙江省
  '哈尔滨市': { latitude: 45.8038, longitude: 126.5350 },
  '齐齐哈尔市': { latitude: 47.3543, longitude: 123.9182 },
  '鸡西市': { latitude: 45.2954, longitude: 130.9693 },
  '鹤岗市': { latitude: 47.3499, longitude: 130.2976 },
  '双鸭山市': { latitude: 46.6464, longitude: 131.1593 },
  '大庆市': { latitude: 46.5874, longitude: 125.1120 },
  '伊春市': { latitude: 47.7279, longitude: 128.8993 },
  '佳木斯市': { latitude: 46.7992, longitude: 130.3189 },
  '七台河市': { latitude: 45.7710, longitude: 131.0032 },
  '牡丹江市': { latitude: 44.5516, longitude: 129.6335 },
  '黑河市': { latitude: 50.2452, longitude: 127.5288 },
  '绥化市': { latitude: 46.6374, longitude: 126.9690 },
  '大兴安岭地区': { latitude: 52.3352, longitude: 124.7116 },

  // 江苏省
  '南京市': { latitude: 32.0603, longitude: 118.7969 },
  '无锡市': { latitude: 31.4912, longitude: 120.3119 },
  '徐州市': { latitude: 34.2058, longitude: 117.2842 },
  '常州市': { latitude: 31.8106, longitude: 119.9740 },
  '苏州市': { latitude: 31.2990, longitude: 120.5853 },
  '南通市': { latitude: 31.9807, longitude: 120.8943 },
  '连云港市': { latitude: 34.5967, longitude: 119.2216 },
  '淮安市': { latitude: 33.5975, longitude: 119.0153 },
  '盐城市': { latitude: 33.3476, longitude: 120.1633 },
  '扬州市': { latitude: 32.3949, longitude: 119.4128 },
  '镇江市': { latitude: 32.1880, longitude: 119.4253 },
  '泰州市': { latitude: 32.4554, longitude: 119.9232 },
  '宿迁市': { latitude: 33.9630, longitude: 118.2757 },

  // 浙江省
  '杭州市': { latitude: 30.2741, longitude: 120.1551 },
  '宁波市': { latitude: 29.8683, longitude: 121.5440 },
  '温州市': { latitude: 27.9939, longitude: 120.6994 },
  '嘉兴市': { latitude: 30.7465, longitude: 120.7509 },
  '湖州市': { latitude: 30.8943, longitude: 120.0867 },
  '绍兴市': { latitude: 30.0297, longitude: 120.5830 },
  '金华市': { latitude: 29.0788, longitude: 119.6475 },
  '衢州市': { latitude: 28.9365, longitude: 118.8594 },
  '舟山市': { latitude: 29.9853, longitude: 122.2070 },
  '台州市': { latitude: 28.6563, longitude: 121.4288 },
  '丽水市': { latitude: 28.4576, longitude: 119.9225 },

  // 安徽省
  '合肥市': { latitude: 31.8206, longitude: 117.2272 },
  '芜湖市': { latitude: 31.3322, longitude: 118.3764 },
  '蚌埠市': { latitude: 32.9418, longitude: 117.3899 },
  '淮南市': { latitude: 32.6254, longitude: 116.9999 },
  '马鞍山市': { latitude: 31.6705, longitude: 118.5079 },
  '淮北市': { latitude: 33.9717, longitude: 116.7983 },
  '铜陵市': { latitude: 30.9299, longitude: 117.8122 },
  '安庆市': { latitude: 30.5375, longitude: 117.0587 },
  '黄山市': { latitude: 29.7147, longitude: 118.3378 },
  '滁州市': { latitude: 32.3016, longitude: 118.3165 },
  '阜阳市': { latitude: 32.8866, longitude: 115.8142 },
  '宿州市': { latitude: 33.6401, longitude: 116.9642 },
  '六安市': { latitude: 31.7355, longitude: 116.5078 },
  '亳州市': { latitude: 33.8693, longitude: 115.7785 },
  '池州市': { latitude: 30.6664, longitude: 117.4892 },
  '宣城市': { latitude: 30.9409, longitude: 118.7589 },

  // 福建省
  '福州市': { latitude: 26.0745, longitude: 119.2965 },
  '厦门市': { latitude: 24.4798, longitude: 118.0894 },
  '莆田市': { latitude: 25.4541, longitude: 119.0077 },
  '三明市': { latitude: 26.2654, longitude: 117.6392 },
  '泉州市': { latitude: 24.8741, longitude: 118.6757 },
  '漳州市': { latitude: 24.5131, longitude: 117.6471 },
  '南平市': { latitude: 26.6436, longitude: 118.1772 },
  '龙岩市': { latitude: 25.0752, longitude: 117.0176 },
  '宁德市': { latitude: 26.6592, longitude: 119.5479 },

  // 江西省
  '南昌市': { latitude: 28.6829, longitude: 115.8579 },
  '景德镇市': { latitude: 29.2688, longitude: 117.1785 },
  '萍乡市': { latitude: 27.6226, longitude: 113.8522 },
  '九江市': { latitude: 29.7050, longitude: 116.0016 },
  '新余市': { latitude: 27.8175, longitude: 114.9171 },
  '鹰潭市': { latitude: 28.2601, longitude: 117.0663 },
  '赣州市': { latitude: 25.8310, longitude: 114.9337 },
  '吉安市': { latitude: 27.1117, longitude: 114.9926 },
  '宜春市': { latitude: 27.7958, longitude: 114.3929 },
  '抚州市': { latitude: 27.9491, longitude: 116.3583 },
  '上饶市': { latitude: 28.4556, longitude: 117.9428 },

  // 山东省
  '济南市': { latitude: 36.6512, longitude: 117.1201 },
  '青岛市': { latitude: 36.0671, longitude: 120.3826 },
  '淄博市': { latitude: 36.8131, longitude: 118.0548 },
  '枣庄市': { latitude: 34.8107, longitude: 117.3238 },
  '东营市': { latitude: 37.4339, longitude: 118.6745 },
  '烟台市': { latitude: 37.4638, longitude: 121.4479 },
  '潍坊市': { latitude: 36.7067, longitude: 119.1619 },
  '济宁市': { latitude: 35.4153, longitude: 116.5871 },
  '泰安市': { latitude: 36.2004, longitude: 117.0879 },
  '威海市': { latitude: 37.5130, longitude: 122.1204 },
  '日照市': { latitude: 35.4164, longitude: 119.5269 },
  '临沂市': { latitude: 35.1041, longitude: 118.3564 },
  '德州市': { latitude: 37.4358, longitude: 116.3575 },
  '聊城市': { latitude: 36.4566, longitude: 115.9859 },
  '滨州市': { latitude: 37.4053, longitude: 117.9707 },
  '菏泽市': { latitude: 35.2333, longitude: 115.4696 },

  // 河南省
  '郑州市': { latitude: 34.7466, longitude: 113.6253 },
  '开封市': { latitude: 34.7971, longitude: 114.3073 },
  '洛阳市': { latitude: 34.6198, longitude: 112.4540 },
  '平顶山市': { latitude: 33.7663, longitude: 113.1927 },
  '安阳市': { latitude: 36.1034, longitude: 114.3929 },
  '鹤壁市': { latitude: 35.7483, longitude: 114.2973 },
  '新乡市': { latitude: 35.3026, longitude: 113.9268 },
  '焦作市': { latitude: 35.2159, longitude: 113.2418 },
  '濮阳市': { latitude: 35.7632, longitude: 115.0294 },
  '许昌市': { latitude: 34.0267, longitude: 113.8526 },
  '漯河市': { latitude: 33.5817, longitude: 114.0165 },
  '三门峡市': { latitude: 34.7732, longitude: 111.2004 },
  '南阳市': { latitude: 32.9909, longitude: 112.5283 },
  '商丘市': { latitude: 34.4144, longitude: 115.6506 },
  '信阳市': { latitude: 32.1286, longitude: 114.0914 },
  '周口市': { latitude: 33.6258, longitude: 114.6416 },
  '驻马店市': { latitude: 33.0118, longitude: 114.0252 },
  '济源市': { latitude: 34.7466, longitude: 113.6253 },

  // 湖北省
  '武汉市': { latitude: 30.5928, longitude: 114.3055 },
  '黄石市': { latitude: 30.2001, longitude: 115.0389 },
  '十堰市': { latitude: 32.6475, longitude: 110.7976 },
  '宜昌市': { latitude: 30.6927, longitude: 111.2868 },
  '襄阳市': { latitude: 32.0090, longitude: 112.1446 },
  '鄂州市': { latitude: 30.3844, longitude: 114.8954 },
  '荆门市': { latitude: 31.0354, longitude: 112.1992 },
  '孝感市': { latitude: 30.9269, longitude: 113.9170 },
  '荆州市': { latitude: 30.3321, longitude: 112.2414 },
  '黄冈市': { latitude: 30.4461, longitude: 114.8724 },
  '咸宁市': { latitude: 29.8416, longitude: 114.3224 },
  '随州市': { latitude: 31.6903, longitude: 113.3824 },
  '恩施土家族苗族自治州': { latitude: 30.2733, longitude: 109.4880 },
  '仙桃市': { latitude: 30.3708, longitude: 113.4539 },
  '潜江市': { latitude: 30.4212, longitude: 112.8997 },
  '天门市': { latitude: 30.6532, longitude: 113.1659 },
  '神农架林区': { latitude: 31.7449, longitude: 110.6718 },

  // 湖南省
  '长沙市': { latitude: 28.2282, longitude: 112.9388 },
  '株洲市': { latitude: 27.8274, longitude: 113.1338 },
  '湘潭市': { latitude: 27.8298, longitude: 112.9443 },
  '衡阳市': { latitude: 26.8968, longitude: 112.5718 },
  '邵阳市': { latitude: 27.2368, longitude: 111.4678 },
  '岳阳市': { latitude: 29.3571, longitude: 113.0969 },
  '常德市': { latitude: 29.0122, longitude: 111.6995 },
  '张家界市': { latitude: 29.1170, longitude: 110.4793 },
  '益阳市': { latitude: 28.5539, longitude: 112.3551 },
  '郴州市': { latitude: 25.7706, longitude: 113.0149 },
  '永州市': { latitude: 26.4201, longitude: 111.6081 },
  '怀化市': { latitude: 27.5500, longitude: 109.9985 },
  '娄底市': { latitude: 27.7001, longitude: 111.9941 },
  '湘西土家族苗族自治州': { latitude: 28.3144, longitude: 109.7393 },

  // 广东省
  '广州市': { latitude: 23.1291, longitude: 113.2644 },
  '韶关市': { latitude: 24.8101, longitude: 113.5972 },
  '深圳市': { latitude: 22.5431, longitude: 114.0579 },
  '珠海市': { latitude: 22.2707, longitude: 113.5767 },
  '汕头市': { latitude: 23.3535, longitude: 116.6820 },
  '佛山市': { latitude: 23.0215, longitude: 113.1214 },
  '江门市': { latitude: 22.5790, longitude: 113.0810 },
  '湛江市': { latitude: 21.2707, longitude: 110.3648 },
  '茂名市': { latitude: 21.6629, longitude: 110.9254 },
  '肇庆市': { latitude: 23.0469, longitude: 112.4658 },
  '惠州市': { latitude: 23.1115, longitude: 114.4152 },
  '梅州市': { latitude: 24.2889, longitude: 116.1178 },
  '汕尾市': { latitude: 22.7864, longitude: 115.3753 },
  '河源市': { latitude: 23.7465, longitude: 114.6974 },
  '阳江市': { latitude: 21.8578, longitude: 111.9827 },
  '清远市': { latitude: 23.6819, longitude: 113.0569 },
  '东莞市': { latitude: 23.0430, longitude: 113.7633 },
  '中山市': { latitude: 22.5171, longitude: 113.3926 },
  '潮州市': { latitude: 23.6570, longitude: 116.6228 },
  '揭阳市': { latitude: 23.5499, longitude: 116.3727 },
  '云浮市': { latitude: 22.9150, longitude: 112.0444 },

  // 广西壮族自治区
  '南宁市': { latitude: 22.8170, longitude: 108.3665 },
  '柳州市': { latitude: 24.3262, longitude: 109.4280 },
  '桂林市': { latitude: 25.2742, longitude: 110.2992 },
  '梧州市': { latitude: 23.4769, longitude: 111.2792 },
  '北海市': { latitude: 21.4813, longitude: 109.1199 },
  '防城港市': { latitude: 21.6868, longitude: 108.3537 },
  '钦州市': { latitude: 21.9794, longitude: 108.6539 },
  '贵港市': { latitude: 23.1115, longitude: 109.5989 },
  '玉林市': { latitude: 22.6368, longitude: 110.1646 },
  '百色市': { latitude: 23.9025, longitude: 106.6186 },
  '贺州市': { latitude: 24.4038, longitude: 111.5673 },
  '河池市': { latitude: 24.6929, longitude: 108.0852 },
  '来宾市': { latitude: 23.7617, longitude: 109.2297 },
  '崇左市': { latitude: 22.3967, longitude: 107.3649 },

  // 海南省
  '海口市': { latitude: 20.0440, longitude: 110.1999 },
  '三亚市': { latitude: 18.2528, longitude: 109.5119 },
  '三沙市': { latitude: 16.8311, longitude: 112.3388 },
  '儋州市': { latitude: 19.1802, longitude: 109.7338 },

  // 四川省
  '成都市': { latitude: 30.5728, longitude: 104.0668 },
  '自贡市': { latitude: 29.3591, longitude: 104.7760 },
  '攀枝花市': { latitude: 26.5823, longitude: 101.7180 },
  '泸州市': { latitude: 28.8718, longitude: 105.4422 },
  '德阳市': { latitude: 31.1270, longitude: 104.3980 },
  '绵阳市': { latitude: 31.4678, longitude: 104.6794 },
  '广元市': { latitude: 32.4354, longitude: 105.8437 },
  '遂宁市': { latitude: 30.5332, longitude: 105.5929 },
  '内江市': { latitude: 29.5833, longitude: 105.0584 },
  '乐山市': { latitude: 29.5520, longitude: 103.7658 },
  '南充市': { latitude: 30.8378, longitude: 106.1106 },
  '眉山市': { latitude: 30.0480, longitude: 103.8482 },
  '宜宾市': { latitude: 28.7696, longitude: 104.6433 },
  '广安市': { latitude: 30.4564, longitude: 106.6333 },
  '达州市': { latitude: 31.2092, longitude: 107.4680 },
  '雅安市': { latitude: 29.9877, longitude: 103.0005 },
  '巴中市': { latitude: 31.8691, longitude: 106.7537 },
  '资阳市': { latitude: 30.1222, longitude: 104.6308 },
  '阿坝藏族羌族自治州': { latitude: 31.8998, longitude: 102.2214 },
  '甘孜藏族自治州': { latitude: 31.6156, longitude: 100.0122 },
  '凉山彝族自治州': { latitude: 27.8823, longitude: 102.2587 },

  // 贵州省
  '贵阳市': { latitude: 26.6470, longitude: 106.6302 },
  '六盘水市': { latitude: 26.5945, longitude: 104.8305 },
  '遵义市': { latitude: 27.7257, longitude: 106.9273 },
  '安顺市': { latitude: 26.2455, longitude: 105.9322 },
  '毕节市': { latitude: 27.3020, longitude: 105.2846 },
  '铜仁市': { latitude: 27.7312, longitude: 109.1898 },
  '黔西南布依族苗族自治州': { latitude: 25.0882, longitude: 104.9060 },
  '黔东南苗族侗族自治州': { latitude: 26.5835, longitude: 107.9852 },
  '黔南布依族苗族自治州': { latitude: 26.2582, longitude: 107.5172 },

  // 云南省
  '昆明市': { latitude: 25.0389, longitude: 102.7183 },
  '曲靖市': { latitude: 25.4900, longitude: 103.7962 },
  '玉溪市': { latitude: 24.3521, longitude: 102.5456 },
  '保山市': { latitude: 25.1121, longitude: 99.1612 },
  '昭通市': { latitude: 27.3379, longitude: 103.7172 },
  '丽江市': { latitude: 26.8721, longitude: 100.2291 },
  '普洱市': { latitude: 22.8268, longitude: 100.9667 },
  '临沧市': { latitude: 23.8878, longitude: 100.0926 },
  '楚雄彝族自治州': { latitude: 25.0329, longitude: 101.5461 },
  '红河哈尼族彝族自治州': { latitude: 23.3668, longitude: 103.3759 },
  '文山壮族苗族自治州': { latitude: 23.3695, longitude: 104.2440 },
  '西双版纳傣族自治州': { latitude: 22.0077, longitude: 100.7979 },
  '大理白族自治州': { latitude: 25.6065, longitude: 100.2587 },
  '德宏傣族景颇族自治州': { latitude: 24.4367, longitude: 98.5785 },
  '怒江傈僳族自治州': { latitude: 25.8509, longitude: 98.8568 },
  '迪庆藏族自治州': { latitude: 27.8269, longitude: 99.7065 },

  // 西藏自治区
  '拉萨市': { latitude: 29.6500, longitude: 91.1000 },
  '日喀则市': { latitude: 29.2690, longitude: 88.8808 },
  '昌都市': { latitude: 31.1368, longitude: 97.1785 },
  '林芝市': { latitude: 29.6490, longitude: 94.3614 },
  '山南市': { latitude: 29.2373, longitude: 91.7665 },
  '那曲市': { latitude: 31.4806, longitude: 92.0670 },
  '阿里地区': { latitude: 32.5002, longitude: 80.1057 },

  // 陕西省
  '西安市': { latitude: 34.3416, longitude: 108.9398 },
  '铜川市': { latitude: 34.8960, longitude: 108.9479 },
  '宝鸡市': { latitude: 34.3614, longitude: 107.2369 },
  '咸阳市': { latitude: 34.3296, longitude: 108.7090 },
  '渭南市': { latitude: 34.5024, longitude: 109.5199 },
  '延安市': { latitude: 36.5853, longitude: 109.4897 },
  '汉中市': { latitude: 33.0677, longitude: 107.0231 },
  '榆林市': { latitude: 38.2884, longitude: 109.7344 },
  '安康市': { latitude: 32.6849, longitude: 109.0289 },
  '商洛市': { latitude: 33.8699, longitude: 109.9404 },

  // 甘肃省
  '兰州市': { latitude: 36.0611, longitude: 103.8343 },
  '嘉峪关市': { latitude: 39.7734, longitude: 98.2891 },
  '金昌市': { latitude: 38.5143, longitude: 102.1877 },
  '白银市': { latitude: 36.5447, longitude: 104.1384 },
  '天水市': { latitude: 34.5809, longitude: 105.7249 },
  '武威市': { latitude: 37.9283, longitude: 102.6370 },
  '张掖市': { latitude: 38.9258, longitude: 100.4495 },
  '平凉市': { latitude: 35.5428, longitude: 106.6849 },
  '酒泉市': { latitude: 39.7320, longitude: 98.4941 },
  '庆阳市': { latitude: 35.7094, longitude: 107.6423 },
  '定西市': { latitude: 35.5806, longitude: 104.6262 },
  '陇南市': { latitude: 33.4013, longitude: 104.9218 },
  '临夏回族自治州': { latitude: 35.6012, longitude: 103.2113 },
  '甘南藏族自治州': { latitude: 34.9863, longitude: 102.9111 },

  // 青海省
  '西宁市': { latitude: 36.6171, longitude: 101.7782 },
  '海东市': { latitude: 36.5029, longitude: 102.1037 },
  '海北藏族自治州': { latitude: 36.9596, longitude: 100.9010 },
  '黄南藏族自治州': { latitude: 35.5177, longitude: 102.0153 },
  '海南藏族自治州': { latitude: 36.2841, longitude: 100.6198 },
  '果洛藏族自治州': { latitude: 34.4715, longitude: 100.2434 },
  '玉树藏族自治州': { latitude: 33.0040, longitude: 97.0085 },
  '海西蒙古族藏族自治州': { latitude: 37.3778, longitude: 97.3708 },

  // 宁夏回族自治区
  '银川市': { latitude: 38.4872, longitude: 106.2309 },
  '石嘴山市': { latitude: 39.0133, longitude: 106.3792 },
  '吴忠市': { latitude: 37.9977, longitude: 106.1992 },
  '固原市': { latitude: 36.0160, longitude: 106.2852 },
  '中卫市': { latitude: 37.5149, longitude: 105.1966 },

  // 新疆维吾尔自治区
  '乌鲁木齐市': { latitude: 43.8256, longitude: 87.6168 },
  '克拉玛依市': { latitude: 45.5799, longitude: 84.8893 },
  '吐鲁番市': { latitude: 42.9513, longitude: 89.1896 },
  '哈密市': { latitude: 42.8335, longitude: 93.5149 },
  '昌吉回族自治州': { latitude: 44.0146, longitude: 87.3056 },
  '博尔塔拉蒙古自治州': { latitude: 44.9052, longitude: 82.0748 },
  '巴音郭楞蒙古自治州': { latitude: 41.9458, longitude: 86.1462 },
  '阿克苏地区': { latitude: 41.1707, longitude: 80.2609 },
  '克孜勒苏柯尔克孜自治州': { latitude: 39.7133, longitude: 76.1685 },
  '喀什地区': { latitude: 39.4704, longitude: 75.9899 },
  '和田地区': { latitude: 37.1107, longitude: 79.9268 },
  '伊犁哈萨克自治州': { latitude: 43.9217, longitude: 81.3174 },
  '塔城地区': { latitude: 46.7453, longitude: 82.9869 },
  '阿勒泰地区': { latitude: 47.8484, longitude: 88.1396 },

  // 台湾省
  '台北市': { latitude: 25.0330, longitude: 121.5654 },
  '新北市': { latitude: 25.0121, longitude: 121.4650 },
  '桃园市': { latitude: 24.9936, longitude: 121.3010 },
  '台中市': { latitude: 24.1477, longitude: 120.6736 },
  '台南市': { latitude: 22.9999, longitude: 120.2269 },
  '高雄市': { latitude: 22.6273, longitude: 120.3014 },
  '基隆市': { latitude: 25.1276, longitude: 121.7392 },
  '新竹市': { latitude: 24.8036, longitude: 120.9686 },
  '嘉义市': { latitude: 23.4801, longitude: 120.4491 },

  // 香港特别行政区
  '香港': { latitude: 22.3193, longitude: 114.1694 },

  // 澳门特别行政区
  '澳门': { latitude: 22.1987, longitude: 113.5439 },
};

/**
 * 省份信息接口
 */
export interface ProvinceInfo {
  code: string;
  name: string;
  cities: CityInfo[];
}

/**
 * 城市信息接口
 */
export interface CityInfo {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * 从 province-city-china 数据中提取省和市
 */
export function getProvinceCityData(): ProvinceInfo[] {
  const provinces: Record<string, ProvinceInfo> = {};

  provinceData.forEach((item: any) => {
    if (item.city === 0) {
      if (!provinces[item.code]) {
        provinces[item.code] = {
          code: item.code,
          name: item.name,
          cities: [],
        };
      }
    } else if (item.area === 0) {
      const provinceCode = item.province + '0000';
      if (provinces[provinceCode]) {
        const coords = CITY_COORDINATES[item.name] || {
          latitude: 39.9042,
          longitude: 116.4074,
        };

        provinces[provinceCode].cities.push({
          code: item.code,
          name: item.name,
          latitude: coords.latitude,
          longitude: coords.longitude,
          timezone: 'Asia/Shanghai',
        });
      }
    }
  });

  const directControlledMunicipalities = ['北京市', '上海市', '天津市', '重庆市'];

  Object.values(provinces).forEach((province) => {
    if (directControlledMunicipalities.includes(province.name)) {
      const coords = CITY_COORDINATES[province.name];
      if (coords && province.cities.length === 0) {
        province.cities.push({
          code: province.code,
          name: province.name,
          latitude: coords.latitude,
          longitude: coords.longitude,
          timezone: 'Asia/Shanghai',
        });
      }
    }
  });

  return Object.values(provinces).sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-CN')
  );
}

/**
 * 根据省份名称获取省份信息
 */
export function getProvinceByName(provinceName: string): ProvinceInfo | undefined {
  const provinces = getProvinceCityData();
  return provinces.find((p) => p.name === provinceName);
}

/**
 * 根据城市名称获取城市信息
 */
export function getCityByName(cityName: string): CityInfo | undefined {
  const provinces = getProvinceCityData();
  for (const province of provinces) {
    const city = province.cities.find((c) => c.name === cityName);
    if (city) {
      return city;
    }
  }
  return undefined;
}

/**
 * 获取所有省份名称列表
 */
export function getProvinceNames(): string[] {
  return getProvinceCityData().map((p) => p.name);
}

/**
 * 根据省份名称获取城市列表
 */
export function getCitiesByProvince(provinceName: string): string[] {
  const province = getProvinceByName(provinceName);
  return province ? province.cities.map((c) => c.name) : [];
}

/**
 * 获取默认省份（北京）
 */
export function getDefaultProvince(): string {
  return '北京市';
}

/**
 * 获取默认城市（北京）
 */
export function getDefaultCity(): string {
  return '北京市';
}

/**
 * 获取默认位置的完整信息
 */
export function getDefaultLocation(): {
  province: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
} {
  const province = getDefaultProvince();
  const cities = getCitiesByProvince(province);
  const city = cities[0] || getDefaultCity();
  const cityInfo = getCityByName(city);

  return {
    province,
    city,
    latitude: cityInfo?.latitude || 39.9042,
    longitude: cityInfo?.longitude || 116.4074,
    timezone: cityInfo?.timezone || 'Asia/Shanghai',
  };
}
