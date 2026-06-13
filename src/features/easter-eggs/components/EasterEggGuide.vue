<template>
  <Modal
    :open="typingApp.guideVisible.value"
    title="✨ Magic Words ✨"
    @close="typingApp.toggleGuide(false)">
    <p class="guide-sub">Type one of these words, then tap a card to see it!</p>

    <ul class="guide-list">
      <li
        v-for="item in typingApp.guideItems.value"
        :key="item.label"
        class="guide-card"
        :class="{ found: typingApp.isHintDiscovered(item.label) }"
        @click="typingApp.previewEasterEgg(item.egg)">
        <span class="card-emojis">{{ item.emojis.join(' ') }}</span>
        <span class="card-word">{{ item.label }}</span>
      </li>
    </ul>
  </Modal>
</template>

<script setup>
import Modal from '@/ui/Modal.vue';
import { useTypingApp } from '@/composables/useTypingApp';

const typingApp = useTypingApp();
</script>

<style scoped>
.guide-sub {
  margin: 6px 0 16px 0;
  color: #444;
}
.guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
.guide-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
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
  font-size: 34px;
  line-height: 1;
}
.card-word {
  font-size: 18px;
  font-weight: 700;
  color: #2b2d42;
  text-transform: lowercase;
}
</style>
