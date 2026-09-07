<template>
  <Modal
    :open="typingApp.guideVisible.value"
    :title="typingApp.guideSecretsOnly.value ? '🤫 Secret Words 🤫' : '✨ Words to Type ✨'"
    @close="typingApp.toggleGuide(false)">
    <p class="guide-sub">
      {{
        typingApp.guideSecretsOnly.value
          ? 'Type one of these on a line of its own to see what it does.'
          : 'Type one of these words, then tap a card to see what it does!'
      }}
    </p>

    <input
      v-model="typingApp.guideFilter.value"
      class="guide-search"
      type="search"
      placeholder="Find a word…"
      aria-label="Find a word" />

    <p
      v-if="typingApp.guideWordCount.value === 0 && typingApp.guideSecrets.value.length === 0"
      class="guide-empty">
      No words like that — try fewer letters.
    </p>

    <section
      v-for="group in typingApp.guideGroups.value"
      :key="group.category"
      class="guide-group">
      <h3 class="guide-group-title">{{ group.label }}</h3>
      <ul class="guide-list">
        <li
          v-for="item in group.items"
          :key="item.word"
          class="guide-card"
          :class="{ found: typingApp.isHintDiscovered(item.word) }"
          @click="typingApp.previewWord(item.word)">
          <span class="card-emojis">{{ item.emoji }}</span>
          <span class="card-word" :class="{ caps: typingApp.isCapsLockEnabled.value }">
            {{ item.word }}
          </span>
        </li>
      </ul>
    </section>

    <section v-if="typingApp.guideSecrets.value.length" class="guide-group">
      <h3 v-if="!typingApp.guideSecretsOnly.value" class="guide-group-title">
        Secret words
      </h3>
      <ul class="guide-list secrets">
        <li
          v-for="secret in typingApp.guideSecrets.value"
          :key="secret.word"
          class="guide-card secret">
          <span class="card-emojis">{{ secret.emoji }}</span>
          <span class="card-word" :class="{ caps: typingApp.isCapsLockEnabled.value }">
            {{ secret.word }}
          </span>
          <span class="card-note">{{ secret.description }}</span>
        </li>
      </ul>
    </section>
  </Modal>
</template>

<script setup>
import Modal from '@/ui/Modal.vue';
import { useTypingApp } from '@/composables/useTypingApp';

const typingApp = useTypingApp();
</script>

<style scoped>
.guide-sub {
  margin: 6px 0 12px 0;
  color: #444;
}
.guide-search {
  width: 100%;
  margin-bottom: 16px;
  padding: 10px 14px;
  border: 2px solid var(--color-text-light);
  border-radius: var(--radius-lg);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-lg);
  outline: none;
}
.guide-search:focus {
  border-color: var(--color-primary);
}
.guide-empty {
  color: #666;
  margin: 0;
}
.guide-group + .guide-group {
  margin-top: 20px;
}
.guide-group-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}
.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.guide-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 12px;
  background: #f4f7fb;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
  user-select: none;
}
.guide-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #4f9cf9;
}
.guide-card.found {
  background: #eafbf3;
  border-color: #0a7;
}
.card-emojis {
  font-size: 30px;
  line-height: 1;
}
.card-word {
  font-family: var(--font-family-mono);
  font-size: 16px;
  font-weight: 700;
  color: #2b2d42;
  text-transform: lowercase;
  text-align: center;
}
/* Secrets aren't in the dictionary, so they say what they do instead of being
   tapped to preview. They're wider, to fit the sentence. */
.guide-list.secrets {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}
.guide-card.secret {
  cursor: default;
  background: #fdf6e6;
}
.guide-card.secret:hover {
  transform: none;
  box-shadow: none;
  border-color: transparent;
}
.card-note {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.3;
}

/* The words are meant to be typed, so they follow the caps lock setting. */
.card-word.caps {
  text-transform: uppercase;
}
</style>
