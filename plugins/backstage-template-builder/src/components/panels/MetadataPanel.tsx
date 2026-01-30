import React, { useState, useEffect } from 'react';
import { useTemplateStore } from '../../store/template-store';
import { Tag, X } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
// Import Backstage frontend APIs
import { useApi } from '@backstage/core-plugin-api';
import { identityApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import type { Entity } from '@backstage/catalog-model';

export default function MetadataPanel() {
  const { state, dispatch } = useTemplateStore();
  const { metadata } = state.template;
  const { spec } = state.template;
  const [tagInput, setTagInput] = useState('');

  // State for entity suggestions (autocomplete)
  const [ownerSuggestions, setOwnerSuggestions] = useState<Entity[]>([]);
  const [systemSuggestions, setSystemSuggestions] = useState<Entity[]>([]);
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);
  const [showSystemSuggestions, setShowSystemSuggestions] = useState(false);

  // Get Backstage APIs
  // identityApiRef: Provides the signed-in user's identity (userEntityRef)
  const identityApi = useApi(identityApiRef);
  // catalogApiRef: Queries the Backstage Catalog for entities (Users, Groups, Systems, etc.)
  const catalogApi = useApi(catalogApiRef);

  // Fetch user identity and set default owner on component mount
  useEffect(() => {
    const initializeDefaults = async () => {
      try {
        // Step 1: Get the current user's identity
        const identity = await identityApi.getBackstageIdentity();
        const userEntityRef = identity.userEntityRef; // e.g., "user:default/jdoe"

        // Step 2: Query the catalog to get the User entity
        const userEntity = await catalogApi.getEntityByRef(userEntityRef);

        if (!userEntity) {
          console.warn('User entity not found in catalog');
          return;
        }

        // Step 3: Extract the groups the user is a member of
        // spec.memberOf contains an array of group refs like ["group:default/platform-team"]
        const memberOf = (userEntity.spec?.memberOf as string[]) || [];

        // Step 4: Set default owner to the first group (if available)
        // Only set if owner is currently empty to avoid overwriting user's manual input
        if (memberOf.length > 0 && !spec.owner) {
          const firstGroup = memberOf[0]; // e.g., "group:default/platform-team"
          dispatch({ type: 'UPDATE_SPEC', payload: { owner: firstGroup } });
        }
      } catch (error) {
        // Handle cases where identity or catalog APIs fail gracefully
        console.error('Failed to initialize defaults from Backstage identity:', error);
      }
    };

    initializeDefaults();
  }, [identityApi, catalogApi, dispatch, spec.owner]);

  // Fetch Group entities for Owner field autocomplete
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Query catalog for all entities of kind "Group"
        const { items } = await catalogApi.getEntities({
          filter: { kind: 'Group' },
          fields: ['metadata.name', 'metadata.namespace', 'kind'],
        });
        setOwnerSuggestions(items);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
        setOwnerSuggestions([]);
      }
    };

    fetchGroups();
  }, [catalogApi]);

  // Fetch System entities for System field autocomplete
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        // Query catalog for all entities of kind "System"
        const { items } = await catalogApi.getEntities({
          filter: { kind: 'System' },
          fields: ['metadata.name', 'metadata.namespace', 'kind'],
        });
        setSystemSuggestions(items);
      } catch (error) {
        console.error('Failed to fetch systems:', error);
        setSystemSuggestions([]);
      }
    };

    fetchSystems();
  }, [catalogApi]);

  const update = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_METADATA', payload: { [field]: value } });
  };

  const updateAnnotation = (key: string, value: string) => {
    const annotations = { ...(metadata.annotations || {}) };
    if (value) {
      annotations[key] = value;
    } else {
      delete annotations[key];
    }
    dispatch({ type: 'UPDATE_METADATA', payload: { annotations } });
  };

  const version = metadata.annotations?.['backstage.io/template-version'] || '';

  const updateSpec = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_SPEC', payload: { [field]: value } });
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !metadata.tags.includes(tag)) {
      dispatch({ type: 'UPDATE_METADATA', payload: { tags: [...metadata.tags, tag] } });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    dispatch({
      type: 'UPDATE_METADATA',
      payload: { tags: metadata.tags.filter((t) => t !== tag) },
    });
  };

  // Helper to format entity ref from entity
  const formatEntityRef = (entity: Entity): string => {
    const namespace = entity.metadata.namespace || 'default';
    const kind = entity.kind.toLowerCase();
    const name = entity.metadata.name;
    return `${kind}:${namespace}/${name}`;
  };

  // Filter suggestions based on input
  const getFilteredOwnerSuggestions = () => {
    if (!spec.owner) return ownerSuggestions.slice(0, 10);
    const query = spec.owner.toLowerCase();
    return ownerSuggestions
      .filter(entity =>
        formatEntityRef(entity).toLowerCase().includes(query) ||
        entity.metadata.name.toLowerCase().includes(query)
      )
      .slice(0, 10);
  };

  const getFilteredSystemSuggestions = () => {
    if (!spec.system) return systemSuggestions.slice(0, 10);
    const query = spec.system.toLowerCase();
    return systemSuggestions
      .filter(entity =>
        formatEntityRef(entity).toLowerCase().includes(query) ||
        entity.metadata.name.toLowerCase().includes(query)
      )
      .slice(0, 10);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Template Metadata</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Configure the basic information about your Backstage software template.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Name (machine-readable)</label>
          <input
            type="text"
            value={metadata.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="my-service-template"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="My Service Template"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Version</label>
          <input
            type="text"
            value={version}
            onChange={(e) => updateAnnotation('backstage.io/template-version', e.target.value)}
            placeholder="1.0.0"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
        <textarea
          value={metadata.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Describe what this template creates..."
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Owner field with Group entity autocomplete */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1">
            Owner
            <Tooltip content="Team or group responsible for this template. Auto-populated from your Backstage groups." />
          </label>
          <input
            type="text"
            value={spec.owner || ''}
            onChange={(e) => updateSpec('owner', e.target.value)}
            onFocus={() => setShowOwnerSuggestions(true)}
            onBlur={() => setTimeout(() => setShowOwnerSuggestions(false), 200)}
            placeholder="group:default/platform-team"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 font-mono"
          />
          {/* Autocomplete suggestions for Groups */}
          {showOwnerSuggestions && getFilteredOwnerSuggestions().length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {getFilteredOwnerSuggestions().map((entity) => (
                <button
                  key={formatEntityRef(entity)}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    updateSpec('owner', formatEntityRef(entity));
                    setShowOwnerSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-0"
                >
                  <div className="font-mono text-xs text-blue-400">{formatEntityRef(entity)}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{entity.metadata.title || entity.metadata.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* System field with System entity autocomplete */}
        <div className="relative">
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1">
            System
            <Tooltip content="Backstage system this template belongs to. Select from your catalog systems." />
          </label>
          <input
            type="text"
            value={spec.system || ''}
            onChange={(e) => updateSpec('system', e.target.value)}
            onFocus={() => setShowSystemSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSystemSuggestions(false), 200)}
            placeholder="system:default/backend-services"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 font-mono"
          />
          {/* Autocomplete suggestions for Systems */}
          {showSystemSuggestions && getFilteredSystemSuggestions().length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {getFilteredSystemSuggestions().map((entity) => (
                <button
                  key={formatEntityRef(entity)}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    updateSpec('system', formatEntityRef(entity));
                    setShowSystemSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-0"
                >
                  <div className="font-mono text-xs text-blue-400">{formatEntityRef(entity)}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{entity.metadata.title || entity.metadata.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1">
            Type
            <Tooltip content="Template category (service, website, library, documentation, etc.)" />
          </label>
          <select
            value={spec.type}
            onChange={(e) => updateSpec('type', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          >
            <option value="service">Service</option>
            <option value="website">Website</option>
            <option value="library">Library</option>
            <option value="documentation">Documentation</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Tags</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add a tag..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          />
          <button
            onClick={addTag}
            className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {metadata.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-blue-200">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
