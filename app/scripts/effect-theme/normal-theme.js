function NormalTheme(scene){

	this.getModels = function(){
	    return {
			kizunaai : {
				modelFile: 'models/kizunaai_mmd/kizunaai.pmx',
				imageUrl: 'https://kizunaai.com/acin/project/wp-content/themes/shapely-child/img/AI.png',
				name: "kizuna ai",
				visible: true
			},
				shachiku_chan: {
				modelFile: 'models/shachiku_mmd/shachiku_chan.pmd',
				imageUrl: "http://dc.dengeki.com/ss/comicweb/pc/images/sp/vitamn-shachiku/cht_01.png",
				name: "社畜ちゃん",
				visible: false
			},
				cafe_chan: {
				modelFile: 'models/cafe_mmd/cafe_chan.pmd',
				imageUrl: 'http://cafechan.net/images/sec02thumb1off.png',
				name: "カフェちゃん",
				visible: false

			},
				tea_chan: {
				modelFile: 'models/tea_mmd/tea_chan.pmd',
				imageUrl: 'http://cafechan.net/images/sec02thumb2off.png',
				name: "ティーちゃん",
				visible: false
			}
	    };
	};

	 this.getModelInfo = function(){
        return ``;
    };

	this.update = function(){

	};
}

//export default NormalTheme;
