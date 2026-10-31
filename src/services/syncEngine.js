/**
 * GOTask - Offline Sync & Conflict Resolution Engine (Phase 9 - P9.6 to P9.8)
 * Implements deterministic conflict resolution and bidirectional merge strategies
 */

/**
 * P9.7: Detect if two versions of the same entity represent an offline conflict
 */
export function detectConflict(localItem, remoteItem) {
  if (!localItem || !remoteItem) {
    return false;
  }
  if (localItem.id !== remoteItem.id) {
    return false;
  }

  const localTime = new Date(
    localItem.updatedAt || localItem.createdAt || 0,
  ).getTime();
  const remoteTime = new Date(
    remoteItem.updatedAt || remoteItem.createdAt || 0,
  ).getTime();

  // If timestamps differ by more than 1 second and values differ, there is a divergence
  const timeDifference = Math.abs(localTime - remoteTime);
  const contentDiffers =
    localItem.title !== remoteItem.title ||
    Boolean(localItem.completed) !== Boolean(remoteItem.completed) ||
    localItem.description !== remoteItem.description;

  return timeDifference > 1000 && contentDiffers;
}

/**
 * P9.7: Resolve conflict using Last-Write-Wins (LWW) with conflict archiving
 */
export function resolveItemConflict(localItem, remoteItem, strategy = 'LWW') {
  const localTime = new Date(
    localItem.updatedAt || localItem.createdAt || 0,
  ).getTime();
  const remoteTime = new Date(
    remoteItem.updatedAt || remoteItem.createdAt || 0,
  ).getTime();

  let winner;
  let loser;
  let resolutionReason;

  if (strategy === 'LWW') {
    if (localTime >= remoteTime) {
      winner = {...localItem};
      loser = {...remoteItem};
      resolutionReason = 'Local item has more recent timestamp';
    } else {
      winner = {...remoteItem};
      loser = {...localItem};
      resolutionReason = 'Remote item has more recent timestamp';
    }
  } else {
    // Default fallback
    winner = {...remoteItem};
    loser = {...localItem};
    resolutionReason = 'Default remote winner';
  }

  return {
    resolvedItem: winner,
    archivedVariant: loser,
    reason: resolutionReason,
    timestamp: new Date().toISOString(),
  };
}

/**
 * P9.8: Bi-directional collection merge with conflict resolution
 */
export function mergeEntityCollections(
  localItems = [],
  remoteItems = [],
  strategy = 'LWW',
) {
  const itemMap = new Map();
  const conflicts = [];
  let additions = 0;
  let updates = 0;

  // Add all local items first
  (localItems || []).forEach(item => {
    if (item && item.id) {
      itemMap.set(String(item.id), {...item});
    }
  });

  // Reconcile with remote items
  (remoteItems || []).forEach(remote => {
    if (!remote || !remote.id) {
      return;
    }
    const strId = String(remote.id);

    if (!itemMap.has(strId)) {
      // New item from remote
      itemMap.set(strId, {...remote});
      additions++;
    } else {
      const local = itemMap.get(strId);
      if (detectConflict(local, remote)) {
        const resolution = resolveItemConflict(local, remote, strategy);
        itemMap.set(strId, resolution.resolvedItem);
        conflicts.push({
          entityId: strId,
          title: local.title,
          ...resolution,
        });
        updates++;
      } else {
        // No conflict: pick the newer one
        const localTime = new Date(local.updatedAt || 0).getTime();
        const remoteTime = new Date(remote.updatedAt || 0).getTime();
        if (remoteTime > localTime) {
          itemMap.set(strId, {...remote});
          updates++;
        }
      }
    }
  });

  return {
    merged: Array.from(itemMap.values()),
    conflicts,
    additions,
    updates,
    totalCount: itemMap.size,
  };
}
