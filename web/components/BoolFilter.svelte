<script>
    import { onMount } from "svelte";
    let wrap;
    let err;
    let expr;
    let mounted = false;
    let invalid = false;
    function makeAst(filter) {
        if (expr) expr.free();
        if (filter === "") {
            invalid = false;
            err = null;
            return null;
        }
        try {
            let ret = window.taglogic.new_expr(filter);
            console.log(ret);
            invalid = false;
            err = null;
            return ret;
        } catch (e) {
            invalid = true;
            err = e;
        }
    }
    $: expr = makeAst(filter);
    export let filter = "";
    export let placeholder = "";
</script>

<style>
    .filter {
        font-family: monospace;
        padding: 0.4rem;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid black;
        margin-bottom: 0.5rem;
    }
    .filter-wrap {
        display: block;
        box-sizing: border-box;
    }
    :global(.filter-wrap > input.invalid) {
        background: #ffcccc;
    }
</style>

<div class="filter-wrap" bind:this={wrap}>
    <input type="text" bind:value={filter} autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class={invalid ? "filter invalid" : "filter"} {placeholder}>
    {#if err}<div class="err">Error: {err || ""}</div>{/if}
</div>
