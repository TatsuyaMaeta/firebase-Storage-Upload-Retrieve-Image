// 参照サイト
// Upload & Retrieve Image on Firebase Storage using JavaScript | English
// https://www.youtube.com/watch?v=ZH-PnY-JGBU

// 画像の名前、保存用のURLのための変数
var imageName, imageUrl;
// ファイル詳細は配列で帰ってくるので配列で定義
var files = [];
// ファイルの読み込みクラスのための変数
var reader;

//  ----------------------- 画像選択ボタンクリック時の処理  -----------------------
document.getElementById("select").onclick = function (e) {
    var input = document.createElement("input");
    // 生成したinputタグのtypeを定義
    input.type = "file";
    let fileName = "";

    let gazounonamae = document.getElementById("namebox").value;

    input.onchange = (e) => {
        // console.dir(e.target);

        files = e.target.files;
        reader = new FileReader();

        let [a, b] = [files[0].name.indexOf("."), files[0].name.length];
        // console.dir([a, b]);

        // imgタグの画像ソースをreaderのresultから定義
        reader.onload = function () {
            document.getElementById("myimg").src = reader.result;
        };
        // console.dir(files[0]);
        reader.readAsDataURL(files[0]);

        setName(gazounonamae);
    };

    input.click();
};

//名前が見入力なら画像の名前をセット
function setName(gazounonamae) {
    if (!gazounonamae) {
        if (files[0].name.indexOf(".") > 0) {
            let hoge = files[0].name.substring(0, files[0].name.indexOf("."));
            document.getElementById("namebox").value = hoge;
        }
    }
}

//----------------------- 画像をstorageにアップロード -----------------------
document.getElementById("upload").onclick = function () {
    //画像の設定名前を変数に代入
    imageName = document.getElementById("namebox").value;
    // console.log(imageName);

    // upLoadTaskにfirebaseクラスのstorageメソッドの中のrefメソッドで
    // storage内に作ってあるImageディレクトリに{imageName}.pngのファイル名でfile[0]を入れる
    var upLoadTask = firebase
        .storage()
        .ref("Images/" + imageName + ".png")
        .put(files[0]);

    // upLoadTaskをonメソッドで処理
    // 状態が変化している時に第２引数のfunctionを実施
    // アップロードしている画像のデータサイズ / 画像データのサイズ % を
    // idがupProgressのラベル内に表示
    upLoadTask.on(
        "state_changed",
        function (snapshot) {
            var progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log(`${snapshot.bytesTransferred} / ${snapshot.totalBytes}`);

            //キャプチャの表示のための読み込み率を表示
            document.getElementById("upProgress").innerHTML =
                "Upload: " + progress + "%";
        },
        //----------------------- アップロードでエラーがあった場合の処理 -----------------------
        function (error) {
            console.dir(error);
            alert("セーブ中にエラーになりました");
        },

        //----------------------- storageに画像がアップできた場合のdatabaseへリンクを載せる -----------------------
        function () {
            upLoadTask.snapshot.ref.getDownloadURL().then(function (url) {
                imageUrl = url;

                console.log(upLoadTask.snapshot.ref.getDownloadURL());
                // console.log(`imageUrl ${imageUrl}`);

                // firebaseクラスのdatabaseメソッドで
                // refarenseメソッドでPicturesディレクトリにimageNameでデータを生成し
                // Nameのkeyで{imageName}とLinkのKeyで{imageUrl}を保存
                firebase
                    .database()
                    .ref("Pictures/" + imageName)
                    .set({ Name: imageName, Link: imageUrl });
                // 成功時にalertを表示
                alert("成功しました！");
            });
        }
    );
};

//----------------------- storageに保存した画像を取得 -----------------------
document.getElementById("retrieve").onclick = function () {
    imageName = document.getElementById("namebox").value;

    firebase
        .database()
        .ref("Pictures/" + imageName)
        .on("value", function (snapshot) {
            console.dir(snapshot.val().Link);
            document.getElementById("myimg").src = snapshot.val().Link;
        });
};
