<script>
    import html2canvas from 'html2canvas';
    import IconButton from '@smui/icon-button';
    import CircularProgress from '@smui/circular-progress';

    let screenshotUrl = '';
    let showTextOnHover = false;
    let imageGenerating = false;
    export let elementID;

    const takeElementScreenshot = async () => {
        imageGenerating = true;
        try {
            const element = document.getElementById(elementID);
            if (!element) {
                console.error('Element not found');
                imageGenerating = false;
                return;
            }

            const canvas = await html2canvas(element);
            const dataUrl = canvas.toDataURL();
            screenshotUrl = dataUrl;
            showTextOnHover = false; // Reset text display when taking a screenshot
            saveImage();
        } catch (error) {
            imageGenerating = false;
            console.error('Error taking screenshot:', error);
        }
    };

    const saveImage = () => {
        const a = document.createElement('a');
        a.href = screenshotUrl;
        a.download = 'screenshot.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        imageGenerating = false;
    };

    const showText = () => {
        showTextOnHover = true;
    };

    const hideText = () => {
        showTextOnHover = false; // Reset text display when hiding the screenshot
    };
</script>

<style>
    /* Add your styles here */
    .screenshot img {
        width: 100%;
        height: auto;
    }

    .hover-text {
        display: none;
        position: absolute;
        top: 40px; /* Adjust as needed */
        left: 0;
        z-index: 1000;
    }

    IconButton:hover + .hover-text {
        display: block;
    }
</style>

<div style="display: flex; justify-content: center">
    <IconButton
            style="margin: 0px"
            class="material-icons"
            on:click={takeElementScreenshot}
            on:mouseenter={showText}
            on:mouseleave={hideText}
    >
        photo_camera
    </IconButton>

    {#if imageGenerating}
        <CircularProgress class="w-6" indeterminate/>
    {/if}

    {#if showTextOnHover}
        <div class="hover-text">
            <p>Take Screenshot</p>
        </div>
    {/if}
</div>
