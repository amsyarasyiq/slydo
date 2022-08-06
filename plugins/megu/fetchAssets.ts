import('node-fetch').then((fetch: any) => {
    fetch("https://raw.githubusercontent.com/WlLDSAKE/Maya-image-bot/main/listodata.py").then(async (result: any) => {
        const text: string = await result.text();
        let isMegu = false;

        const meguLinks = text.split("\n").map(line => {
            if (isMegu) {
                if (line.trim() === ")") {
                    isMegu = false;
                    return;
                }

                return line.trim().replace('\"', '').replace('\",', '');
            }
            if (line.includes("Megu_list = (")) {
                isMegu = true;
            }
        });

        console.log(meguLinks);
    });
});