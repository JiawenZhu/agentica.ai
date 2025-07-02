import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, Edit, Play, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { vogentService, VogentAgent } from '../services/vogentService';
import { VogentVoiceCall } from './VogentVoiceCall';

interface VogentAgentManagerProps {
  className?: string;
}

export function VogentAgentManager({ className = '' }: VogentAgentManagerProps) {
  const [agents, setAgents] = useState<VogentAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<VogentAgent | null>(null);
  const [testingAgent, setTestingAgent] = useState<VogentAgent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    language: 'en-US',
    maxDurationSeconds: 10800,
  });

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const agentList = await vogentService.listAgents();
      console.log(`Loaded ${agentList.length} Vogent agents`);
      setAgents(agentList);
      if (agentList.length > 0) {
        toast.success(`Loaded ${agentList.length} Vogent agents`);
      }
    } catch (error) {
      console.error('Error loading Vogent agents:', error);
      setError('Failed to load Vogent agents. Please check your API key and try again.');
      toast.error('Failed to load Vogent agents');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (agent: VogentAgent) => {
    setEditingAgent(agent);
    setEditFormData({
      name: agent.name,
      language: agent.language,
      maxDurationSeconds: agent.maxDurationSeconds || 10800,
    });
  };

  const handleEditAgent = async () => {
    if (!editingAgent || !editFormData.name.trim()) {
      toast.error('Please provide a valid agent name');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        name: editFormData.name,
        language: editFormData.language,
        maxDurationSeconds: editFormData.maxDurationSeconds,
      };

      const updatedAgent = await vogentService.updateAgent(editingAgent.id, updatedData);
      setAgents(prev => prev.map(agent => 
        agent.id === editingAgent.id ? { ...agent, ...updatedData } : agent
      ));
      toast.success(`Agent "${updatedData.name}" updated successfully!`);
      setEditingAgent(null);
    } catch (error) {
      console.error('Error updating Vogent agent:', error);
      toast.error(`Failed to update agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (agent: VogentAgent) => {
    if (!confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      return;
    }

    try {
      await vogentService.deleteAgent(agent.id);
      setAgents(prev => prev.filter(a => a.id !== agent.id));
      toast.success(`Agent "${agent.name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting Vogent agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 p-6 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vogent Agents</h2>
          <p className="text-gray-800 dark:text-gray-200 font-medium">View your Vogent AI voice agents</p>
        </div>
        <Button 
          onClick={loadAgents}
          disabled={loading}
          variant="outline"
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-200 border border-green-800"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Vogent Agents</h3>
          <p className="text-red-600 dark:text-red-400 mb-4 max-w-md mx-auto">{error}</p>
          <Button onClick={loadAgents} variant="outline" className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
            Try Again
          </Button>
        </div>
      )}

      {/* Agents Grid */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="relative group hover:shadow-xl transition-all duration-200 border-2 hover:border-green-400 dark:hover:border-green-500 bg-white dark:bg-gray-900 shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800 dark:to-emerald-900 rounded-t-lg border-b border-green-300 dark:border-green-600">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center border border-green-300 dark:border-green-600">
                      <Bot className="w-5 h-5 text-green-800 dark:text-green-200" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        {agent.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100 border-green-400 dark:border-green-500 font-semibold">
                          {agent.language}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 border-blue-400 dark:border-blue-600 font-semibold">
                          Vogent
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                <div className="space-y-4">
                  {/* Agent Status - Always Active for Vogent */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Status</span>
                    <Badge variant="outline" className="bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 border-green-400 dark:border-green-600 font-bold">
                      Active
                    </Badge>
                  </div>

                  {/* Agent ID */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Agent ID</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {agent.id}
                    </span>
                  </div>

                  {/* Max Duration */}
                  {agent.maxDurationSeconds && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Max Duration</span>
                      <Badge variant="outline" className="bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 border-blue-400 dark:border-blue-600 font-bold">
                        {Math.floor(agent.maxDurationSeconds / 3600)}h {Math.floor((agent.maxDurationSeconds % 3600) / 60)}m
                      </Badge>
                    </div>
                  )}

                  {/* Voice Sensitivity */}
                  {agent.utteranceDetectorConfig?.sensitivity && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Sensitivity</span>
                      <Badge variant="outline" className="bg-purple-200 text-purple-900 dark:bg-purple-800 dark:text-purple-100 border-purple-400 dark:border-purple-600 font-bold">
                        {agent.utteranceDetectorConfig.sensitivity}
                      </Badge>
                    </div>
                  )}

                  {/* Transcriber */}
                  {agent.transcriberParams?.type && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Transcriber</span>
                      <Badge variant="outline" className="bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100 border-orange-400 dark:border-orange-600 font-bold">
                        {agent.transcriberParams.type}
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTestingAgent(agent)}
                      className="flex-1 bg-green-200 text-green-900 border-green-400 hover:bg-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600 dark:hover:bg-green-700 font-bold shadow-md hover:shadow-lg"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(agent)}
                      className="flex-1 bg-blue-200 text-blue-900 border-blue-400 hover:bg-blue-300 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-600 dark:hover:bg-blue-700 font-bold shadow-md hover:shadow-lg"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent)}
                      className="bg-red-200 text-red-900 border-red-400 hover:bg-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600 dark:hover:bg-red-700 font-bold shadow-md hover:shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && agents.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Vogent agents found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            No agents were found in your Vogent account. Create agents through the Vogent dashboard or check your API configuration.
          </p>
          <Button 
            onClick={loadAgents}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Edit Agent: {editingAgent?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Agent Name */}
            <div>
              <Label htmlFor="agent_name" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                Agent Name *
              </Label>
              <Input
                id="agent_name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Agent name"
                className="w-full"
              />
            </div>

            {/* Language */}
            <div>
              <Label htmlFor="language" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                Language
              </Label>
              <Select
                value={editFormData.language}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                  <SelectItem value="en-GB">🇬🇧 English (UK)</SelectItem>
                  <SelectItem value="es-ES">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="fr-FR">🇫🇷 French</SelectItem>
                  <SelectItem value="de-DE">🇩🇪 German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Duration */}
            <div>
              <Label htmlFor="max_duration" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                Max Duration (seconds)
              </Label>
              <Input
                id="max_duration"
                type="number"
                value={editFormData.maxDurationSeconds}
                onChange={(e) => setEditFormData(prev => ({ ...prev, maxDurationSeconds: parseInt(e.target.value) || 10800 }))}
                min="60"
                max="86400"
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleEditAgent}
                disabled={!editFormData.name.trim() || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Updating...' : 'Update Agent'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingAgent(null)}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={!!testingAgent} onOpenChange={() => setTestingAgent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
              Test Agent: {testingAgent?.name}
            </DialogTitle>
          </DialogHeader>
          {testingAgent && (
            <div className="py-4">
              <VogentVoiceCall
                agentId={testingAgent.id}
                agentName={testingAgent.name}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VogentAgentManager; 