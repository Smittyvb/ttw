<script>
    import { onMount } from "svelte";

    const flatpickrPromise = import("flatpickr");
    const now = new Date();
    const longTimeAgo = new Date();
    longTimeAgo.setFullYear(longTimeAgo.getFullYear() - 1);
    let defaultRange = [now, longTimeAgo];
    export let range = [];
    let pickerEle;
    let picker = null;
    onMount(async () => {
        const flatpickr = (await flatpickrPromise).default;
        picker = flatpickr(pickerEle, {
            mode: "range",
            appendTo: pickerEle,
            time_24hr: true,
            allowInput: true,
            enableTime: true,
            inline: true,
            defaultDate: defaultRange,
        });
        picker.selectedDates = range.length === 2 ? range : [now, longTimeAgo];
        picker.config.onChange.push((selectedDates, dateStr, instance) => {
            if (selectedDates.length === 2) {
                range = selectedDates;
            }
        });
        picker.changeYear(now.getFullYear());
    });
    function rangeSelect(rangeType, qual) {
        return () => {
            let range = [];
            if (rangeType === "rel") {
                const curNow = new Date();
                const beginning = new Date();
                beginning.setDate(beginning.getDate() - qual);
                range = [curNow, beginning];
            } else if (rangeType === "calRel") {
                const start = new Date();
                const end = new Date();
                switch (qual) {
                    case "year":
                        start.setMonth(0);
                        end.setMonth(11);
                        // fallthrough
                    case "month":
                        start.setDate(1);
                        end.setMonth(end.getMonth() + 1);
                        end.setDate(0);
                        // fallthrough
                    case "today":
                        start.setHours(0, 0, 0, 0);
                        end.setHours(23, 59, 59, 999);
                }
                range = [start, end];
            }
            if (picker) {
                picker.setDate(range, true);
            } else {
                defaultRange = range;
            }
        };
    }
</script>

<style>
    .sugg {
        display: inline-block;
        border-radius: 21px;
        background: #005644;
        color: white;
        cursor: pointer;

        padding-top: 2px;
        padding-bottom: 2px;
        padding-left: 6px;
        padding-right: 6px;

        margin-bottom: 0.5rem;
    }
    .suggs {
        width: 307.875px; /* flatpickr calendar width */
    }
</style>

<div>
    <div class="suggs">
        <span class="sugg" on:click={rangeSelect("calRel", "today")}>Today</span>
        <span class="sugg" on:click={rangeSelect("calRel", "month")}>This month</span>
        <span class="sugg" on:click={rangeSelect("calRel", "year")}>This year</span>
        <span class="sugg" on:click={rangeSelect("rel", 30)}>Last 30 days</span>
        <span class="sugg" on:click={rangeSelect("rel", 90)}>Last 90 days</span>
        <span class="sugg" on:click={rangeSelect("rel", 365)}>Last 365 days</span>
    </div>
    <div bind:this={pickerEle}></div>
</div>
